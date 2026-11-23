import api from "./apiInstance";

export type ProductCategory =
  | "Electronics"
  | "Clothing"
  | "Footwear"
  | "Home & Kitchen"
  | "Beauty"
  | "Books"
  | "Sports"
  | "Accessories"
  | "Other";

export type ProductVariant = {
  _id?: string;
  size: string;
  color: string;
  img: string;
  price: number;
  quantity: number;
};

export type Product = {
  _id: string;
  name: string;
  description: string;
  variants: ProductVariant[];
  category: ProductCategory;
  vendor?: string | { _id: string; username?: string };
  likesCount?: number;
  isLiked?: boolean;
};

export type ProductInput = Omit<Product, "_id" | "likesCount" | "isLiked" | "vendor">;

export type ProductListResponse = {
  success: boolean;
  message: string;
  products: Product[];
  topProducts: Product[];
  likedProducts: Product[];
};

type ProductResponse = {
  success: boolean;
  message: string;
  product: Product;
};

type ProductDeleteResponse = {
  success: boolean;
  message: string;
};

export type ProductFilters = {
  search?: string;
  category?: ProductCategory;
  stock?: "in-stock" | "low-stock" | "out-of-stock";
};

export const getProductVariants = (product: Product) =>
  Array.isArray(product.variants) ? product.variants : [];

export const getProductQuantity = (product: Product) =>
  getProductVariants(product).reduce(
    (total, variant) => total + (Number(variant.quantity) || 0),
    0,
  );

export const getProductPrice = (product: Product) => {
  const variants = getProductVariants(product);
  if (variants.length === 0) return 0;

  const prices = variants
    .map((variant) => Number(variant.price))
    .filter((price) => Number.isFinite(price));
  return prices.length ? Math.min(...prices) : 0;
};

export const getProductImage = (product: Product) =>
  getProductVariants(product).find((variant) => variant.img)?.img;

export const getProducts = (filters: ProductFilters = {}) =>
  api.get<ProductListResponse>("/api/products", {
    params: filters,
  });

export const getVendorProducts = (filters: ProductFilters = {}) =>
  api.get<ProductListResponse>("/api/products/vendor", {
    params: filters,
  });

export const likeProduct = (id: string) =>
  api.post<{ success: boolean; liked: boolean; likesCount: number }>(
    `/api/products/${id}/like`,
  );

export const unlikeProduct = (id: string) =>
  api.delete<{ success: boolean; liked: boolean; likesCount: number }>(
    `/api/products/${id}/like`,
  );

export const createProduct = (product: ProductInput) =>
  api.post<ProductResponse>("/api/products/create", product);

export const updateProduct = (id: string, product: ProductInput) =>
  api.post<ProductResponse>(`/api/products/update/${id}`, product);

export const deleteProduct = (id: string) =>
  api.post<ProductDeleteResponse>(`/api/products/delete/${id}`);