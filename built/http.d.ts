/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import * as http from 'node:http';
import * as https from 'node:https';
export declare function getAgents(proxy?: string): {
    httpAgent: http.Agent;
    httpsAgent: https.Agent;
};
