import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { client } from '../common/clients/redis.connection.js';

export const createRateLimiter = () =>
    rateLimit({
        windowMs: 60 * 1000,
        limit: 10,
        standardHeaders: false,
        legacyHeaders: false,
        handler: (req, res, next) => {
            next(new Error('too many requests try again later'));
        },
        keyGenerator: (req) => {
            const forwarded = req.headers['x-forwarded-for'];
            const ip = (forwarded ? forwarded.split(',')[0].trim() : req.ip);
            return ipKeyGenerator(ip);
        },
        store: new RedisStore({
            sendCommand: (...args) => client.sendCommand(args),
        }),
    });