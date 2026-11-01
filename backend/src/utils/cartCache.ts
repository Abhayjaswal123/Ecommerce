import {
    getCache,
    setCache,
    deleteCache,
} from "./redis.js";

export const getCartCacheKey = (userId: string) =>
    `cart:${userId}`;

export const getCachedCart = async (userId: string) =>
    getCache(getCartCacheKey(userId));

export const setCachedCart = async (
    userId: string,
    cart: unknown
) => setCache(getCartCacheKey(userId), cart, 300);

export const invalidateCartCache = async (userId: string) =>
    deleteCache(getCartCacheKey(userId));
