/// <reference types="node" />
/// <reference types="node" />
import * as http from 'node:http';
import * as https from 'node:https';
import type { FastifyInstance } from 'fastify';
export type MediaProxyOptions = {
    ['Access-Control-Allow-Origin']?: string;
    ['Access-Control-Allow-Headers']?: string;
    ['Content-Security-Policy']?: string;
    userAgent?: string;
    allowedPrivateNetworks?: string[];
    maxSize?: number;
} & ({
    proxy?: string;
} | {
    httpAgent: http.Agent;
    httpsAgent: https.Agent;
});
export declare function setMediaProxyConfig(setting?: MediaProxyOptions | null): void;
export default function (fastify: FastifyInstance, options: MediaProxyOptions | null | undefined, done: (err?: Error) => void): void;
