import config from './config.js';
import app from './built/index.js';

export default function (fastify, opts, next) {
    return app(fastify, { ...config, ...opts }, next);
}
