import api from "./apiInstance";

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Out for Delivery"
  | "Delivered";

export type OrderPerson = {
  _id: string;
  username: string;
};

export type Order = {
  _id: string;
  user: string | OrderPerson | null;
  vendor: string | OrderPerson | null;
  items?: {
    product: string;
    name?: string;
    img?: string;
    unitPrice?: number | null;
    price?: number | null;
    quantity?: number | null;
  }[] | null;
  subtotal?: number | null;
  shipping?: number | null;
  total?: number | null;
  paymentMethod?: "COD" | string;
  paymentStatus?: "Pending" | "Paid" | string;
  status?: OrderStatus | string;
  createdAt?: string;
};

export const createOrder = (paymentMethod: "COD") =>
  api.post<{ success: boolean; message: string; orders: Order[] }>(
    "/api/orders",
    { paymentMethod },
  );

export const getOrders = () =>
  api.get<{ success: boolean; orders: Order[] }>("/api/orders");

export const updateOrderStatus = (orderId: string, status: OrderStatus) =>
  api.patch<{ success: boolean; message: string; order: Order }>(
    `/api/orders/${orderId}/status`,
    { status },
  );
