export declare function detectType(path: string): Promise<{
    mime: string;
    ext: string | null;
}>;
declare const dictionary: {
    'safe-file': string[];
    'sharp-convertible-image': string[];
    'sharp-animation-convertible-image': string[];
};
export declare const isMimeImage: (mime: string, type: keyof typeof dictionary) => boolean;
export {};
