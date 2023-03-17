import sharp from 'sharp';
import { Readable } from 'node:stream';

export type IImage = {
    data: Buffer;
    ext: string | null;
    type: string;
};

export type IImageStream = {
    data: Readable;
    ext: string | null;
    type: string;
};

export type IImageStreamable = IImage | IImageStream;

export const webpDefault: sharp.WebpOptions = {
    quality: 77,
    alphaQuality: 95,
    lossless: false,
    nearLossless: false,
    smartSubsample: true,
    mixed: true,
    effort: 2,
};

export function convertToWebpStream(path: string, width: number, height: number, options: sharp.WebpOptions = webpDefault): IImageStream {
    return convertSharpToWebpStream(sharp(path), width, height, options);
}

export function convertSharpToWebpStream(sharp: sharp.Sharp, width: number, height: number, options: sharp.WebpOptions = webpDefault): IImageStream {
    const data = sharp
        .resize(width, height, {
            fit: 'inside',
            withoutEnlargement: true,
        })
        .rotate()
        .webp(options)

    return {
        data,
        ext: 'webp',
        type: 'image/webp',
    };
}