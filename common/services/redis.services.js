import { client } from "../clients/redis.connection.js";

export const set = async (key, value, options) => {
    return await client.set(key, value, options)
}
export const get = async (key) => {
    return await client.get(key)
}
export const del = async (key) => {
    return await client.del(key)
}
export const ttl = async (key) => {
    return await client.ttl(key)
}
export const incr = async function (key) {
    return await client.incr(key);
};

export const expire = async function (key, seconds) {
    return await client.expire(key, seconds);
};

export const calculate = (expiration) => {
    const currentTime = Math.floor(Date.now() / 1000)

    return expiration - currentTime
}