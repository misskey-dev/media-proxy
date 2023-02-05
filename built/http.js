import * as http from 'node:http';
import * as https from 'node:https';
import CacheableLookup from 'cacheable-lookup';
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent';
const cache = new CacheableLookup({
    maxTtl: 3600,
    errorTtl: 30,
    lookup: false, // nativeのdns.lookupにfallbackしない
});
const _http = new http.Agent({
    keepAlive: true,
    keepAliveMsecs: 30 * 1000,
    lookup: cache.lookup,
});
const _https = new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 30 * 1000,
    lookup: cache.lookup,
});
export function getAgents(proxy) {
    const httpAgent = proxy
        ? new HttpProxyAgent({
            keepAlive: true,
            keepAliveMsecs: 30 * 1000,
            maxSockets: 256,
            maxFreeSockets: 256,
            scheduling: 'lifo',
            proxy: proxy,
        })
        : _http;
    const httpsAgent = proxy
        ? new HttpsProxyAgent({
            keepAlive: true,
            keepAliveMsecs: 30 * 1000,
            maxSockets: 256,
            maxFreeSockets: 256,
            scheduling: 'lifo',
            proxy: proxy,
        })
        : _https;
    return {
        httpAgent,
        httpsAgent,
    };
}
