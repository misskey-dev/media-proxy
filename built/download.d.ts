/// <reference types="node" />
/// <reference types="node" />
import * as http from 'node:http';
import * as https from 'node:https';
export type DownloadConfig = {
    [x: string]: any;
    userAgent: string;
    allowedPrivateNetworks: string[];
    maxSize: number;
    httpAgent: http.Agent;
    httpsAgent: https.Agent;
    proxy?: boolean;
};
export declare const defaultDownloadConfig: {
    httpAgent: http.Agent;
    httpsAgent: https.Agent;
    userAgent: string;
    allowedPrivateNetworks: never[];
    maxSize: number;
    proxy: boolean;
};
export declare function downloadUrl(url: string, path: string, settings?: DownloadConfig): Promise<{
    filename: string;
}>;
