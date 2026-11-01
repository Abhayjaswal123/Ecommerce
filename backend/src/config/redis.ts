
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    throw new Error("REDIS_URL is missing in environment variables");
}

const redisClient = createClient({
    url: redisUrl,
});

redisClient.on("error", (error) => {
    console.error("Redis connection error:", error);
});

export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log("Redis connected successfully");
    }
};

export default redisClient;
