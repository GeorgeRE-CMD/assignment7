import { createClient } from "redis";
import { redis } from "../../config/system.config.js";
export const client = createClient(
    { url: redis.URL }
)
client.on("error", function (err) {
    console.error("Redis Client Error:", err);
});

export async function connectToRedis() {
    if (client.isOpen) {
        return;
    }
    if (!redis.URL) {
        throw new Error("Redis URL is missing");
    }
    await client.connect();
    console.log("Redis connected successfully");
}