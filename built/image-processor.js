import sharp from 'sharp';
export const webpDefault = {
    quality: 77,
    alphaQuality: 95,
    lossless: false,
    nearLossless: false,
    smartSubsample: true,
    mixed: true,
    effort: 2,
};
export function convertToWebpStream(path, width, height, options = webpDefault) {
    return convertSharpToWebpStream(sharp(path), width, height, options);
}
export function convertSharpToWebpStream(sharp, width, height, options = webpDefault) {
    const data = sharp
        .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
    })
        .rotate()
        .webp(options);
    return {
        data,
        ext: 'webp',
        type: 'image/webp',
    };
}
