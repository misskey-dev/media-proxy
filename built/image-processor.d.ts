/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
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
export declare const webpDefault: sharp.WebpOptions;
export declare function convertToWebpStream(path: string, width: number, height: number, options?: sharp.WebpOptions): IImageStream;
export declare function convertSharpToWebpStream(sharp: sharp.Sharp, width: number, height: number, options?: sharp.WebpOptions): IImageStream;
