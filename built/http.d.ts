/// <reference types="node" />
/// <reference types="node" />
import * as http from 'node:http';
import * as https from 'node:https';
export declare function getAgents(proxy?: string): {
    httpAgent: http.Agent;
    httpsAgent: https.Agent;
};
