import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  CreditCard,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getCart,
  removeCartItem,
  updateCartItem,
  type CartLine,
  type CartResponse,
} from "@/api/cart";
import type { Product } from "@/api/product";

const formatPrice = (price: number) =>
  `₹${price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message;
  }

  return error instanceof Error ? error.message : "Something went wrong.";
};

export default function Cart() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod" | null>(
    null,
  );
  const [checkoutNotice, setCheckoutNotice] = useState("");
  const [cartItems, setCartItems] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>(
    {},
  );

  const applyCartResponse = useCallback((response: CartResponse) => {
    setCartItems(response.cart?.items ?? []);
  }, []);

  const loadCart = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await getCart();
      applyCartResponse(response.data);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [applyCartResponse]);

  useEffect(() => {
    let active = true;

    getCart()
      .then((response) => {
        if (active) applyCartResponse(response.data);
      })
      .catch((error: unknown) => {
        if (active) setPageError(getErrorMessage(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [applyCartResponse]);

  const updateItem = async (productId: string, quantity: number) => {
    if (updatingItems[productId]) return;

    setUpdatingItems((previous) => ({ ...previous, [productId]: true }));
    setPageError("");

    try {
      const response = quantity === 0
        ? await removeCartItem(productId)
        : await updateCartItem(productId, quantity);
      applyCartResponse(response.data);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setUpdatingItems((previous) => ({ ...previous, [productId]: false }));
    }
  };

  const availableItems = useMemo(
    () =>
      cartItems.filter(
        (item): item is CartLine & { product: Product } => item.product !== null,
      ),
    [cartItems],
  );
  const subtotal = availableItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );
  const itemCount = availableItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const shipping = subtotal === 0 || subtotal >= 1500 ? 0 : 80;
  const total = subtotal + shipping;

  return (
    <>
    <div className="min-h-screen bg-[#171821] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/products"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#91B5D9] transition hover:text-[#A5E2DB]"
        >
          <ArrowLeft size={18} />
          Continue Shopping
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-[#A5E2DB]/15 p-3 text-[#A5E2DB]">
            <ShoppingCart size={25} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Shopping Cart
            </h1>
            <p className="mt-1 text-sm text-[#91B5D9]">
              {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
            </p>
          </div>
        </div>

        {pageError && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {pageError}
            <button
              type="button"
              onClick={() => void loadCart()}
              className="ml-3 font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div
            role="status"
            className="rounded-2xl border border-[#30313D] bg-[#20212B] px-6 py-16 text-center text-[#91B5D9]"
          >
            Loading your cart...
          </div>
        ) : availableItems.length === 0 ? (
          <div className="rounded-2xl border border-[#30313D] bg-[#20212B] px-6 py-16 text-center">
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-[#292B36] text-[#91B5D9]">
              <Package size={30} />
            </div>
            <h2 className="text-xl font-semibold text-white">
              Your cart is empty
            </h2>
            <p className="mt-2 text-sm text-[#91B5D9]">
              Browse products and add something you love.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex rounded-xl bg-[#A5E2DB] px-5 py-3 text-sm font-semibold text-[#171821] transition hover:bg-[#8BD4CB]"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
            <section
              aria-label="Cart items"
              className="space-y-4 lg:col-span-2"
            >
              {availableItems.map((item) => {
                const product = item.product;
                const isUpdating = updatingItems[product._id] ?? false;

                return (
                  <article
                    key={item._id}
                    className="flex flex-col gap-4 rounded-2xl border border-[#30313D] bg-[#20212B] p-4 transition hover:border-[#A5E2DB]/40 sm:flex-row sm:items-center sm:p-5"
                  >
                    <img
                      src={product.img || "https://placehold.co/120x120?text=Product"}
                      alt={product.name}
                      className="size-24 rounded-xl border border-[#30313D] bg-[#171821] object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <h2 className="font-semibold text-white">
                        {product.name}
                      </h2>
                      <p className="mt-1 text-sm text-[#91B5D9]">
                        {formatPrice(product.price)} per item
                      </p>
                      <p className="mt-2 font-bold text-[#A5E2DB]">
                        {formatPrice(product.price * item.quantity)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <div className="flex items-center rounded-lg border border-[#30313D] bg-[#171821]">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            void updateItem(product._id, item.quantity - 1)
                          }
                          aria-label={`Decrease ${product.name} quantity`}
                          className="rounded-l-lg p-2 text-[#91B5D9] transition hover:bg-[#30313D] hover:text-[#A5E2DB] disabled:opacity-50"
                        >
                          <Minus size={15} />
                        </button>
                        <span
                          aria-live="polite"
                          className="min-w-8 text-center text-sm font-semibold text-white"
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={isUpdating || item.quantity >= product.quantity}
                          onClick={() =>
                            void updateItem(product._id, item.quantity + 1)
                          }
                          aria-label={`Increase ${product.name} quantity`}
                          className="rounded-r-lg p-2 text-[#91B5D9] transition hover:bg-[#30313D] hover:text-[#A5E2DB] disabled:opacity-50"
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => void updateItem(product._id, 0)}
                        className="inline-flex items-center gap-1 text-sm text-red-400 transition hover:text-red-300 disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="rounded-2xl border border-[#30313D] bg-[#20212B] p-5 sm:p-6">
              <h2 className="text-lg font-bold text-white">Order Summary</h2>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between text-[#91B5D9]">
                  <span>Subtotal</span>
                  <span className="text-white">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#91B5D9]">
                  <span>Shipping</span>
                  <span className="text-[#A5E2DB]">
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
                <p className="text-xs text-[#91B5D9]/70">
                  Free shipping on orders of ₹1,500 or more.
                </p>
                <div className="border-t border-[#30313D] pt-4">
                  <div className="flex justify-between text-base font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-[#A5E2DB]">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod(null);
                  setCheckoutNotice("");
                  setCheckoutOpen(true);
                }}
                className="mt-6 w-full rounded-xl bg-[#A5E2DB] px-4 py-3 font-semibold text-[#171821] transition hover:bg-[#8BD4CB]"
              >
                Checkout
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
    <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
      <DialogContent className="border-[#30313D] bg-[#20212B] text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">
            Choose a payment method
          </DialogTitle>
          <DialogDescription className="text-[#91B5D9]">
            Select how you would like to pay for your {itemCount}{" "}
            {itemCount === 1 ? "item" : "items"}.
          </DialogDescription>
        </DialogHeader>

        <fieldset className="mt-5 space-y-3">
          <legend className="sr-only">Payment method</legend>
          <label
            className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
              paymentMethod === "online"
                ? "border-[#A5E2DB] bg-[#A5E2DB]/10"
                : "border-[#30313D] hover:border-[#A5E2DB]/50"
            }`}
          >
            <input
              type="radio"
              name="payment-method"
              value="online"
              checked={paymentMethod === "online"}
              onChange={() => {
                setPaymentMethod("online");
                setCheckoutNotice("");
              }}
              className="accent-[#A5E2DB]"
            />
            <CreditCard className="size-5 shrink-0 text-[#A5E2DB]" />
            <span className="flex-1">
              <span className="block font-semibold">Pay now</span>
              <span className="mt-1 block text-sm text-[#91B5D9]">
                Pay online using a payment method.
              </span>
            </span>
          </label>

          <label
            className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
              paymentMethod === "cod"
                ? "border-[#A5E2DB] bg-[#A5E2DB]/10"
                : "border-[#30313D] hover:border-[#A5E2DB]/50"
            }`}
          >
            <input
              type="radio"
              name="payment-method"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={() => {
                setPaymentMethod("cod");
                setCheckoutNotice("");
              }}
              className="accent-[#A5E2DB]"
            />
            <Truck className="size-5 shrink-0 text-[#A5E2DB]" />
            <span className="flex-1">
              <span className="block font-semibold">Cash on delivery</span>
              <span className="mt-1 block text-sm text-[#91B5D9]">
                Pay when your order arrives.
              </span>
            </span>
          </label>
        </fieldset>

        {checkoutNotice && (
          <p
            role="status"
            className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-200"
          >
            {checkoutNotice}
          </p>
        )}

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setCheckoutOpen(false)}
            className="rounded-xl border border-[#30313D] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!paymentMethod}
            onClick={() =>
              setCheckoutNotice(
                "Checkout is not configured yet. No payment was taken and your cart is unchanged.",
              )
            }
            className="rounded-xl bg-[#A5E2DB] px-4 py-2.5 text-sm font-semibold text-[#171821] transition hover:bg-[#8BD4CB] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
