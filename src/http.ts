import * as http from 'node:http';
import * as https from 'node:https';
import CacheableLookup from 'cacheable-lookup';
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent';
import config from "../config.js";

const cache = new CacheableLookup({
    maxTtl: 3600,	// 1hours
    errorTtl: 30,	// 30secs
    lookup: false,	// nativeのdns.lookupにfallbackしない
});

const _http = new http.Agent({
    keepAlive: true,
    keepAliveMsecs: 30 * 1000,
    lookup: cache.lookup,
} as http.AgentOptions);

const _https = new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 30 * 1000,
    lookup: cache.lookup,
} as https.AgentOptions);

export const httpAgent = config.proxy
    ? new HttpProxyAgent({
        keepAlive: true,
        keepAliveMsecs: 30 * 1000,
        maxSockets: 256,
        maxFreeSockets: 256,
        scheduling: 'lifo',
        proxy: config.proxy,
    })
    : _http;

export const httpsAgent = config.proxy
    ? new HttpsProxyAgent({
        keepAlive: true,
        keepAliveMsecs: 30 * 1000,
        maxSockets: 256,
        maxFreeSockets: 256,
        scheduling: 'lifo',
        proxy: config.proxy,
    })
    : _https;