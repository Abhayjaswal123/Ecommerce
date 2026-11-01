import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowRight,
  Boxes,
  CircleAlert,
  ClipboardList,
  Package,
  RefreshCw,
  ShoppingBag,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getOrders, updateOrderStatus, type Order, type OrderStatus } from "../api/orders";
import { getVendorProducts, type Product } from "../api/product";
import { useAuth } from "../context/Authcontext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  Pending: "Confirmed",
  Confirmed: "Out for Delivery",
  "Out for Delivery": "Delivered",
};

const statusStyles: Record<OrderStatus, string> = {
  Pending: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  Confirmed: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  "Out for Delivery": "border-violet-400/30 bg-violet-400/10 text-violet-200",
  Delivered: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
};

const colors = ["#ffb547", "#a5e0d9", "#e8b6e4", "#29b9f5"];

const formatPrice = (value: number) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong.";
};

const getCustomerName = (order: Order) =>
  typeof order.user === "object" &&
  order.user !== null &&
  typeof order.user.username === "string"
    ? order.user.username
    : "Customer";

const getOrderValue = (order: Order) =>
  typeof order.total === "number" && Number.isFinite(order.total)
    ? order.total
    : 0;

const getOrderUnits = (order: Order) =>
  (Array.isArray(order.items) ? order.items : []).reduce(
    (total, item) =>
      total +
      (typeof item.quantity === "number" && Number.isFinite(item.quantity)
        ? item.quantity
        : 0),
    0,
  );

const isOrderStatus = (status: string | undefined): status is OrderStatus =>
  status === "Pending" ||
  status === "Confirmed" ||
  status === "Out for Delivery" ||
  status === "Delivered";

function Home() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const loadDashboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [ordersResponse, productsResponse] = await Promise.all([
        getOrders(),
        getVendorProducts(),
      ]);
      setOrders(
        Array.isArray(ordersResponse.data.orders)
          ? ordersResponse.data.orders
          : [],
      );
      setProducts(
        Array.isArray(productsResponse.data.products)
          ? productsResponse.data.products
          : [],
      );
      setError("");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadDashboard(), 0);
    const poll = window.setInterval(() => void loadDashboard(true), 10000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(poll);
    };
  }, [loadDashboard]);

  const stats = useMemo(() => {
    const customerIds = new Set(
      orders
        .map((order) =>
          typeof order.user === "string"
            ? order.user
            : order.user?._id,
        )
        .filter((id): id is string => Boolean(id)),
    );
    const productUnits = orders.reduce(
      (total, order) => total + getOrderUnits(order),
      0,
    );

    return [
      {
        label: "Order value",
        value: formatPrice(orders.reduce((total, order) => total + getOrderValue(order), 0)),
        detail: "Includes COD orders not yet collected",
        icon: ShoppingBag,
        color: colors[0],
      },
      {
        label: "Total orders",
        value: String(orders.length),
        detail: `${orders.filter((order) => order.status === "Pending").length} awaiting acceptance`,
        icon: ClipboardList,
        color: colors[1],
      },
      {
        label: "Units ordered",
        value: String(productUnits),
        detail: `${products.length} active products`,
        icon: Boxes,
        color: colors[2],
      },
      {
        label: "Customers",
        value: String(customerIds.size),
        detail: `${products.filter((product) => product.quantity <= 5).length} products low in stock`,
        icon: UsersRound,
        color: colors[3],
      },
    ];
  }, [orders, products]);

  const bestSellingProducts = useMemo(() => {
    const orderedUnits = new Map<string, number>();
    for (const order of orders) {
      for (const item of order.items ?? []) {
        if (typeof item.product !== "string") continue;
        const quantity =
          typeof item.quantity === "number" && Number.isFinite(item.quantity)
            ? item.quantity
            : 0;
        orderedUnits.set(
          item.product,
          (orderedUnits.get(item.product) ?? 0) + quantity,
        );
      }
    }

    return products
      .map((product) => ({
        ...product,
        unitsOrdered: orderedUnits.get(product._id) ?? 0,
      }))
      .sort((first, second) => second.unitsOrdered - first.unitsOrdered)
      .slice(0, 5);
  }, [orders, products]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (first, second) =>
            new Date(second.createdAt ?? 0).getTime() -
            new Date(first.createdAt ?? 0).getTime(),
        )
        .slice(0, 6),
    [orders],
  );

  const advanceOrder = async (order: Order, status: OrderStatus) => {
    setUpdatingOrderId(order._id);
    setError("");
    try {
      await updateOrderStatus(order._id, status);
      await loadDashboard(true);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      await loadDashboard(true);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const greeting = user ? `Welcome back, ${user.username}` : "Welcome";

  return (
    <div className="min-h-screen bg-[#171821] p-3 text-slate-100 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Vendor Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-400 sm:text-base">
              {greeting} — here’s your live store overview.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-[#a5e0d9] transition hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {loading && orders.length === 0 && products.length === 0 ? (
          <div role="status" className="rounded-2xl border border-white/10 bg-[#20212b] p-12 text-center text-slate-400">
            Loading your store data...
          </div>
        ) : (
          <>
            <section aria-label="Store overview">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map(({ label, value, detail, icon: Icon, color }) => (
                  <Card
                    key={label}
                    className="min-w-0 rounded-2xl border-white/10 bg-[#20212b] text-white"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-400">
                            {label}
                          </p>
                          <p className="mt-3 break-words text-2xl font-bold">
                            {value}
                          </p>
                        </div>
                        <span
                          className="grid size-11 shrink-0 place-items-center rounded-xl"
                          style={{ backgroundColor: `${color}20`, color }}
                        >
                          <Icon size={22} />
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-slate-400">{detail}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.8fr)]">
              <Card className="min-w-0 overflow-hidden rounded-2xl border-white/10 bg-[#20212b] text-white">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">Recent orders</CardTitle>
                    <p className="mt-1 text-sm text-slate-400">
                      Review new orders and update their delivery progress.
                    </p>
                  </div>
                  <Link
                    to="/orders"
                    className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#a5e0d9] hover:text-white"
                  >
                    All orders <ArrowRight size={15} />
                  </Link>
                </CardHeader>
                <CardContent className="px-3 pb-5 sm:px-5">
                  {recentOrders.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-[#171821] p-8 text-center">
                      <ClipboardList className="mx-auto mb-3 size-8 text-slate-500" />
                      <p className="font-medium">No orders yet</p>
                      <p className="mt-1 text-sm text-slate-400">
                        Orders for your products will show up here.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-slate-400">Customer</TableHead>
                            <TableHead className="text-slate-400">Total</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                            <TableHead className="text-right text-slate-400">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentOrders.map((order) => {
                            const status = isOrderStatus(order.status)
                              ? order.status
                              : undefined;
                            const next = status ? nextStatus[status] : undefined;
                            return (
                              <TableRow
                                key={order._id}
                                className="border-white/[0.06]"
                              >
                                <TableCell className="max-w-40">
                                  <p className="truncate font-medium">
                                    {getCustomerName(order)}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {order.createdAt
                                      ? new Date(order.createdAt).toLocaleDateString()
                                      : "Date unavailable"}
                                  </p>
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                  {formatPrice(getOrderValue(order))}
                                </TableCell>
                                <TableCell>
                                  <span
                                    className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                      status
                                        ? statusStyles[status]
                                        : "border-slate-500/30 bg-slate-500/10 text-slate-300"
                                    }`}
                                  >
                                    {status ?? "Unknown"}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  {next ? (
                                    <button
                                      type="button"
                                      disabled={updatingOrderId === order._id}
                                      onClick={() => void advanceOrder(order, next)}
                                      className="whitespace-nowrap rounded-lg bg-[#a5e0d9] px-3 py-2 text-xs font-semibold text-[#171821] hover:bg-[#8bd5cc] disabled:opacity-50"
                                    >
                                      {updatingOrderId === order._id
                                        ? "Updating..."
                                        : status === "Pending"
                                          ? "Accept"
                                          : status === "Confirmed"
                                            ? "Dispatch"
                                            : "Deliver"}
                                    </button>
                                  ) : (
                                    <span className="text-xs text-slate-500">—</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="min-w-0 overflow-hidden rounded-2xl border-white/10 bg-[#20212b] text-white">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">Best-selling products</CardTitle>
                    <p className="mt-1 text-sm text-slate-400">
                      Ranked by units in customer orders.
                    </p>
                  </div>
                  <Link
                    to="/vendor-products"
                    aria-label="Manage products"
                    className="rounded-lg p-2 text-[#a5e0d9] hover:bg-white/5"
                  >
                    <Package size={19} />
                  </Link>
                </CardHeader>
                <CardContent className="space-y-3">
                  {bestSellingProducts.length === 0 ? (
                    <div className="rounded-xl border border-white/10 bg-[#171821] p-8 text-center">
                      <Package className="mx-auto mb-3 size-8 text-slate-500" />
                      <p className="font-medium">No products listed yet</p>
                      <Link
                        to="/vendor-products"
                        className="mt-3 inline-flex text-sm font-semibold text-[#a5e0d9] hover:text-white"
                      >
                        Add a product <ArrowRight className="ml-1 size-4" />
                      </Link>
                    </div>
                  ) : (
                    bestSellingProducts.map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#171821] p-3"
                      >
                        {product.img ? (
                          <img
                            src={product.img}
                            alt=""
                            className="size-11 rounded-lg object-cover"
                          />
                        ) : (
                          <span className="grid size-11 place-items-center rounded-lg bg-white/5 text-slate-400">
                            <Package size={18} />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {product.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {product.unitsOrdered} ordered · {product.quantity} in stock
                          </p>
                        </div>
                        {product.quantity <= 5 && (
                          <span
                            className={`inline-flex items-center gap-1 whitespace-nowrap text-xs ${
                              product.quantity === 0
                                ? "text-red-300"
                                : "text-amber-200"
                            }`}
                          >
                            <CircleAlert size={14} />
                            {product.quantity === 0 ? "Out" : "Low"}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/vendor-products"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
              >
                <Package size={17} /> Manage products
              </Link>
              <Link
                to="/orders"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
              >
                <ClipboardList size={17} /> Manage all orders
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
