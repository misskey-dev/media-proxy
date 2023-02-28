import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import fastifyStatic from '@fastify/static';
import { createTemp } from './create-temp.js';
import { FILE_TYPE_BROWSERSAFE } from './const.js';
import { convertToWebpStream, webpDefault } from './image-processor.js';
import { detectType, isMimeImage } from './file-info.js';
import sharp from 'sharp';
import { StatusError } from './status-error.js';
import { defaultDownloadConfig, downloadUrl } from './download.js';
import { getAgents } from './http.js';
import _contentDisposition from 'content-disposition';
const _filename = fileURLToPath(import.meta.url);
const _dirname = dirname(_filename);
const assets = `${_dirname}/../assets/`;
let config = defaultDownloadConfig;
export function setMediaProxyConfig(setting) {
    const proxy = process.env.HTTP_PROXY ?? process.env.http_proxy;
    if (!setting) {
        config = {
            ...defaultDownloadConfig,
            ...(proxy ? getAgents(proxy) : {}),
            proxy: !!proxy,
        };
        console.log(config);
        return;
    }
    config = {
        userAgent: setting.userAgent ?? defaultDownloadConfig.userAgent,
        allowedPrivateNetworks: setting.allowedPrivateNetworks ?? defaultDownloadConfig.allowedPrivateNetworks,
        maxSize: setting.maxSize ?? defaultDownloadConfig.maxSize,
        ...('proxy' in setting ?
            { ...getAgents(setting.proxy), proxy: !!setting.proxy } :
            'httpAgent' in setting ? {
                httpAgent: setting.httpAgent,
                httpsAgent: setting.httpsAgent,
                proxy: true,
            } :
                { ...getAgents(proxy), proxy: !!proxy }),
    };
    console.log(config);
}
export default function (fastify, options, done) {
    setMediaProxyConfig(options);
    const corsOrigin = options['Access-Control-Allow-Origin'] ?? '*';
    const corsHeader = options['Access-Control-Allow-Headers'] ?? '*';
    const csp = options['Content-Security-Policy'] ?? `default-src 'none'; img-src 'self'; media-src 'self'; style-src 'unsafe-inline'`;
    fastify.addHook('onRequest', (request, reply, done) => {
        reply.header('Access-Control-Allow-Origin', corsOrigin);
        reply.header('Access-Control-Allow-Headers', corsHeader);
        reply.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
        reply.header('Content-Security-Policy', csp);
        done();
    });
    fastify.register(fastifyStatic, {
        root: _dirname,
        serve: false,
    });
    fastify.get('/:url*', async (request, reply) => {
        return await proxyHandler(request, reply)
            .catch(err => errorHandler(request, reply, err));
    });
    done();
}
function errorHandler(request, reply, err) {
    console.log(`${err}`);
    reply.header('Cache-Control', 'max-age=300');
    if (request.query && 'fallback' in request.query) {
        return reply.sendFile('/dummy.png', assets);
    }
    if (err instanceof StatusError && (err.statusCode === 302 || err.isClientError)) {
        reply.code(err.statusCode);
        return;
    }
    reply.code(500);
    return;
}
async function proxyHandler(request, reply) {
    const url = 'url' in request.query ? request.query.url : (request.params.url && 'https://' + request.params.url);
    if (!url || typeof url !== 'string') {
        reply.code(400);
        return;
    }
    // Create temp file
    const file = await downloadAndDetectTypeFromUrl(url);
    try {
        const isConvertibleImage = isMimeImage(file.mime, 'sharp-convertible-image');
        const isAnimationConvertibleImage = isMimeImage(file.mime, 'sharp-animation-convertible-image');
        if ('emoji' in request.query ||
            'avatar' in request.query ||
            'static' in request.query ||
            'preview' in request.query ||
            'badge' in request.query) {
            if (!isConvertibleImage) {
                // 画像でないなら404でお茶を濁す
                throw new StatusError('Unexpected mime', 404);
            }
        }
        let image = null;
        if ('emoji' in request.query || 'avatar' in request.query) {
            if (!isAnimationConvertibleImage && !('static' in request.query)) {
                image = {
                    data: fs.createReadStream(file.path),
                    ext: file.ext,
                    type: file.mime,
                };
            }
            else {
                const data = sharp(file.path, { animated: !('static' in request.query) })
                    .resize({
                    height: 'emoji' in request.query ? 128 : 320,
                    withoutEnlargement: true,
                })
                    .webp(webpDefault);
                image = {
                    data,
                    ext: 'webp',
                    type: 'image/webp',
                };
            }
        }
        else if ('static' in request.query) {
            image = convertToWebpStream(file.path, 498, 280);
        }
        else if ('preview' in request.query) {
            image = convertToWebpStream(file.path, 200, 200);
        }
        else if ('badge' in request.query) {
            const mask = sharp(file.path)
                .resize(96, 96, {
                fit: 'inside',
                withoutEnlargement: false,
            })
                .greyscale()
                .normalise()
                .linear(1.75, -(128 * 1.75) + 128) // 1.75x contrast
                .flatten({ background: '#000' })
                .toColorspace('b-w');
            const stats = await mask.clone().stats();
            if (stats.entropy < 0.1) {
                // エントロピーがあまりない場合は404にする
                throw new StatusError('Skip to provide badge', 404);
            }
            const data = sharp({
                create: { width: 96, height: 96, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
            })
                .pipelineColorspace('b-w')
                .boolean(await mask.png().toBuffer(), 'eor');
            image = {
                data: await data.png().toBuffer(),
                ext: 'png',
                type: 'image/png',
            };
        }
        else if (file.mime === 'image/svg+xml') {
            image = convertToWebpStream(file.path, 2048, 2048);
        }
        else if (!file.mime.startsWith('image/') || !FILE_TYPE_BROWSERSAFE.includes(file.mime)) {
            throw new StatusError('Rejected type', 403, 'Rejected type');
        }
        if (!image) {
            image = {
                data: fs.createReadStream(file.path),
                ext: file.ext,
                type: file.mime,
            };
        }
        if ('cleanup' in file) {
            if ('pipe' in image.data && typeof image.data.pipe === 'function') {
                // image.dataがstreamなら、stream終了後にcleanup
                const cleanup = () => {
                    file.cleanup();
                    image = null;
                };
                image.data.on('end', cleanup);
                image.data.on('close', cleanup);
            }
            else {
                // image.dataがstreamでないなら直ちにcleanup
                file.cleanup();
            }
        }
        reply.header('Content-Type', image.type);
        reply.header('Cache-Control', 'max-age=31536000, immutable');
        reply.header('Content-Disposition', contentDisposition('inline', correctFilename(file.filename, image.ext)));
        return reply.send(image.data);
    }
    catch (e) {
        if ('cleanup' in file)
            file.cleanup();
        throw e;
    }
}
async function downloadAndDetectTypeFromUrl(url) {
    const [path, cleanup] = await createTemp();
    try {
        const { filename } = await downloadUrl(url, path, config);
        const { mime, ext } = await detectType(path);
        return {
            state: 'remote',
            mime, ext,
            path, cleanup,
            filename: correctFilename(filename, ext),
        };
    }
    catch (e) {
        cleanup();
        throw e;
    }
}
function correctFilename(filename, ext) {
    const dotExt = ext ? `.${ext}` : '.unknown';
    if (filename.endsWith(dotExt)) {
        return filename;
    }
    if (ext === 'jpg' && filename.endsWith('.jpeg')) {
        return filename;
    }
    if (ext === 'tif' && filename.endsWith('.tiff')) {
        return filename;
    }
    return `${filename}${dotExt}`;
}
function contentDisposition(type, filename) {
    const fallback = filename.replace(/[^\w.-]/g, '_');
    return _contentDisposition(filename, { type, fallback });
}
