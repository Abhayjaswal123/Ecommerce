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

export type Product = {
  _id: string;
  name: string;
  img: string;
  description: string;
  price: number;
  quantity: number;
  category: ProductCategory;
};

export type ProductInput = Omit<Product, "_id">;

type ProductListResponse = {
  success: boolean;
  message: string;
  products: Product[];
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

export const getVendorProducts = (filters: ProductFilters = {}) =>
  api.get<ProductListResponse>("/api/products/vendor", {
    params: filters,
  });

export const createProduct = (product: ProductInput) =>
  api.post<ProductResponse>("/api/products/create", product);

export const updateProduct = (id: string, product: ProductInput) =>
  api.post<ProductResponse>(`/api/products/update/${id}`, product);

export const deleteProduct = (id: string) =>
  api.post<ProductDeleteResponse>(`/api/products/delete/${id}`);
