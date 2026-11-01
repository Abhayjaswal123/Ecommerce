import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Check, Package, RefreshCw, Truck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getOrders, updateOrderStatus, type Order, type OrderStatus } from "../api/orders";
import { useAuth } from "../context/Authcontext";

const steps: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Out for Delivery",
  "Delivered",
];

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

const toPriceNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const formatPrice = (price: unknown) => {
  const amount = toPriceNumber(price);
  return amount === null
    ? "—"
    : `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
};

const isOrderStatus = (status: string | undefined): status is OrderStatus =>
  status !== undefined && steps.includes(status as OrderStatus);

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong.";
};

const getPersonName = (
  person: Order["user"] | Order["vendor"] | undefined,
  fallback: string,
) =>
  typeof person === "object" && person !== null &&
  typeof person.username === "string" && person.username.length > 0
    ? person.username
    : fallback;

export default function Orders() {
  const { user } = useAuth();
  const location = useLocation();
  const isVendor = user?.role === "vendor";
  const deliveredOnly = location.pathname === "/delivered";
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const refreshOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await getOrders();
      setOrders(Array.isArray(response.data.orders) ? response.data.orders : []);
      setError("");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void refreshOrders(), 0);
    const timer = window.setInterval(() => void refreshOrders(true), 10000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(timer);
    };
  }, [refreshOrders]);

  const changeStatus = async (order: Order, status: OrderStatus) => {
    setUpdatingId(order._id);
    setError("");
    try {
      const response = await updateOrderStatus(order._id, status);
      setOrders((current) =>
        current.map((item) =>
          item._id === order._id ? response.data.order : item,
        ),
      );
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      await refreshOrders(true);
      setError(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const visibleOrders = deliveredOnly
    ? orders.filter((order) => order.status === "Delivered")
    : orders;

  return (
    <div className="min-h-screen bg-[#171821] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#A5E2DB]/15 p-3 text-[#A5E2DB]">
              {isVendor ? <Truck size={25} /> : <Package size={25} />}
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                {deliveredOnly
                  ? "Delivered Orders"
                  : isVendor
                    ? "Manage Orders"
                    : "My Orders"}
              </h1>
              <p className="mt-1 text-sm text-[#91B5D9]">
                {isVendor
                  ? "Review orders for your products and update delivery progress."
                  : "Track each order and check its payment status."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void refreshOrders()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-[#30313D] px-4 py-2.5 text-sm font-semibold text-[#A5E2DB] transition hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            role="status"
            className="rounded-2xl border border-[#30313D] bg-[#20212B] px-6 py-16 text-center text-[#91B5D9]"
          >
            Loading orders...
          </div>
        ) : error && orders.length === 0 ? (
          <div className="rounded-2xl border border-[#30313D] bg-[#20212B] px-6 py-16 text-center">
            <p className="text-sm text-red-300">
              Orders could not be loaded. Please try again.
            </p>
            <button
              type="button"
              onClick={() => void refreshOrders()}
              className="mt-5 rounded-xl bg-[#A5E2DB] px-5 py-3 text-sm font-semibold text-[#171821] transition hover:bg-[#8BD4CB]"
            >
              Retry
            </button>
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="rounded-2xl border border-[#30313D] bg-[#20212B] px-6 py-16 text-center">
            <Package className="mx-auto mb-4 size-10 text-[#91B5D9]" />
            <h2 className="text-xl font-semibold">
              {deliveredOnly ? "No delivered orders yet" : "No orders yet"}
            </h2>
            <p className="mt-2 text-sm text-[#91B5D9]">
              {isVendor
                ? "Orders for your products will appear here."
                : "Your placed orders and their delivery progress will appear here."}
            </p>
            {!isVendor && (
              <Link
                to="/products"
                className="mt-6 inline-flex rounded-xl bg-[#A5E2DB] px-5 py-3 text-sm font-semibold text-[#171821] transition hover:bg-[#8BD4CB]"
              >
                Browse Products
              </Link>
            )}
          </div>
        ) : (
          <section aria-label="Orders" className="space-y-5">
            {visibleOrders.map((order) => {
              const status = isOrderStatus(order.status)
                ? order.status
                : undefined;
              const next = status ? nextStatus[status] : undefined;
              const currentStep = status ? steps.indexOf(status) : -1;
              const items = Array.isArray(order.items)
                ? order.items.filter(
                    (item): item is NonNullable<typeof item> =>
                      typeof item === "object" && item !== null,
                  )
                : [];
              const paymentStatus = order.paymentStatus ?? "Unknown";
              const date = order.createdAt
                ? new Date(order.createdAt).toLocaleString()
                : "Date unavailable";

              return (
                <article
                  key={order._id}
                  className="rounded-2xl border border-[#30313D] bg-[#20212B] p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#30313D] pb-5">
                    <div>
                      <p className="text-sm text-[#91B5D9]">Order ID</p>
                      <p className="mt-1 break-all font-mono text-sm text-white">
                        {order._id}
                      </p>
                      <p className="mt-2 text-xs text-[#91B5D9]">
                        Placed {date}
                        {isVendor
                          ? ` · Customer: ${getPersonName(order.user, "Customer")}`
                          : ` · Seller: ${getPersonName(order.vendor, "Seller")}`}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${
                        status ? statusStyles[status] : "border-slate-500/30 bg-slate-500/10 text-slate-300"
                      }`}
                    >
                      {status ?? "Status unavailable"}
                    </span>
                  </div>

                  <div className="grid gap-6 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)]">
                    <div className="space-y-3">
                      {items.map((item, index) => {
                        const quantity =
                          toPriceNumber(item.quantity) ?? 0;
                        const unitPrice = toPriceNumber(
                          item.unitPrice ?? item.price,
                        );
                        return (
                        <div
                          key={`${order._id}-${item.product ?? index}`}
                          className="flex items-center gap-3 rounded-xl bg-[#171821] p-3"
                        >
                          <img
                            src={
                              item.img ||
                              "https://placehold.co/80x80?text=Product"
                            }
                            alt={item.name ?? "Order item"}
                            className="size-14 rounded-lg border border-[#30313D] object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                              {item.name ?? "Product details unavailable"}
                            </p>
                            <p className="mt-1 text-sm text-[#91B5D9]">
                              Qty {quantity} × {formatPrice(unitPrice)}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-[#A5E2DB]">
                            {formatPrice(
                              unitPrice === null ? null : quantity * unitPrice,
                            )}
                          </p>
                        </div>
                        );
                      })}
                    </div>

                    <div className="rounded-xl border border-[#30313D] p-4">
                      <h2 className="font-semibold">Delivery progress</h2>
                      <ol className="mt-4 space-y-3">
                        {steps.map((step, index) => {
                          const complete = index <= currentStep;
                          return (
                            <li
                              key={step}
                              className={`flex items-center gap-3 text-sm ${
                                complete ? "text-white" : "text-slate-500"
                              }`}
                            >
                              <span
                                className={`grid size-6 shrink-0 place-items-center rounded-full ${
                                  complete
                                    ? "bg-[#A5E2DB] text-[#171821]"
                                    : "border border-slate-600"
                                }`}
                              >
                                {complete ? <Check size={14} /> : index + 1}
                              </span>
                              {step}
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-end justify-between gap-4 border-t border-[#30313D] pt-5">
                    <div className="space-y-1 text-sm">
                      <p className="text-[#91B5D9]">
                        Payment: Cash on Delivery ·{" "}
                        <span className="font-semibold text-amber-200">
                          {paymentStatus}
                        </span>
                      </p>
                      <p className="text-xs text-[#91B5D9]">
                        COD remains pending until payment is collected.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#91B5D9]">
                        Subtotal {formatPrice(order.subtotal)} · Shipping{" "}
                        {order.shipping === 0
                          ? "Free"
                          : formatPrice(order.shipping)}
                      </p>
                      <p className="mt-1 text-lg font-bold text-[#A5E2DB]">
                        Total {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>

                  {isVendor && next && (
                    <div className="mt-5 flex justify-end">
                      <button
                        type="button"
                        disabled={updatingId === order._id}
                        onClick={() => void changeStatus(order, next)}
                        className="rounded-xl bg-[#A5E2DB] px-5 py-2.5 text-sm font-semibold text-[#171821] transition hover:bg-[#8BD4CB] disabled:cursor-wait disabled:opacity-50"
                      >
                        {updatingId === order._id
                          ? "Updating..."
                          : order.status === "Pending"
                            ? "Accept Order"
                            : order.status === "Confirmed"
                              ? "Out for Delivery"
                              : "Mark as Delivered"}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}
