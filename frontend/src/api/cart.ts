import api from "./apiInstance";
import type { Product } from "./product";

export type CartLine = {
  _id: string;
  product: Product | null;
  variantId?: string | null;
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

export const addCartItem = (
  productId: string,
  variantId: string,
  quantity = 1,
) => api.post<CartResponse>(`/api/cart/${productId}`, { quantity, variantId });

export const updateCartItem = (
  productId: string,
  quantity: number,
  variantId?: string | null,
) =>
  api.patch<CartResponse>(`/api/cart/${productId}`, {
    quantity,
    ...(variantId ? { variantId } : {}),
  });

export const removeCartItem = (productId: string, variantId?: string | null) =>
  api.delete<CartResponse>(`/api/cart/${productId}`, {
    params: variantId ? { variantId } : undefined,
  });
