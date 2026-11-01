import redisClient from "../config/redis.js";

export const getCache = async <T>(key: string): Promise<T | null> => {
    try {
        const data = await redisClient.get(key);

        return data ? (JSON.parse(data) as T) : null;
    } catch (error) {
        console.error("Redis get error:", error);
        return null;
    }
};

export const setCache = async (
    key: string,
    data: unknown,
    expiry: number = 300
): Promise<void> => {
    try {
        await redisClient.set(key, JSON.stringify(data), {
            EX: expiry,
        });
    } catch (error) {
        console.error("Redis set error:", error);
    }
};

export const deleteCache = async (key: string): Promise<void> => {
    try {
        await redisClient.del(key);
    } catch (error) {
        console.error("Redis delete error:", error);
    }
};
