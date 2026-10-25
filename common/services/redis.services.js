import { client } from "../clients/redis.connection.js";

export const set = async (key, payload, options) => {
    return await client.set(payload, key, options)
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

export const calculate = (expiration) => {
    const currentTime = Math.floor(Date.now() / 1000)

    return expiration - currentTime
}