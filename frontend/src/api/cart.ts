import api from "./apiInstance";
import type { Product } from "./product";

export type CartLine = {
  _id: string;
  product: Product | null;
  quantity: number;
};

export type CartData = {
  items: CartLine[];
};

export type CartResponse = {
  message?: string;
  cart: CartData | null;
};

export const getCart = () => api.get<CartResponse>("/api/cart");

export const addCartItem = (productId: string, quantity = 1) =>
  api.post<CartResponse>(`/api/cart/${productId}`, { quantity });

export const updateCartItem = (productId: string, quantity: number) =>
  api.patch<CartResponse>(`/api/cart/${productId}`, { quantity });

export const removeCartItem = (productId: string) =>
  api.delete<CartResponse>(`/api/cart/${productId}`);
