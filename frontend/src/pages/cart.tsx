import { useState } from "react";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Package,
} from "lucide-react";
import { Link } from "react-router-dom";

type CartItem = {
  _id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      _id: "1",
      name: "Premium T-Shirt",
      price: 499,
      quantity: 1,
      image: "https://placehold.co/120x120?text=T-Shirt",
    },
    {
      _id: "2",
      name: "Casual Hoodie",
      price: 999,
      quantity: 2,
      image: "https://placehold.co/120x120?text=Hoodie",
    },
  ]);

  const updateQuantity = (id: string, change: number) => {
    setCartItems((items) =>
      items
        .map((item) =>
          item._id === id
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item._id !== id));
  };

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const shipping = subtotal === 0 || subtotal >= 1500 ? 0 : 80;
  const total = subtotal + shipping;

  const formatPrice = (price: number) =>
    `₹${price.toLocaleString("en-IN")}`;

  return (
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
              {cartItems.length} different{" "}
              {cartItems.length === 1 ? "item" : "items"} in your cart
            </p>
          </div>
        </div>

        {cartItems.length === 0 ? (
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

            <section className="space-y-4 lg:col-span-2">
              {cartItems.map((item) => (
                <article
                  key={item._id}
                  className="flex flex-col gap-4 rounded-2xl border border-[#30313D] bg-[#20212B] p-4 transition hover:border-[#A5E2DB]/40 sm:flex-row sm:items-center sm:p-5"
                >
                  <img
                    src={
                      item.image ||
                      "https://placehold.co/120x120?text=Product"
                    }
                    alt={item.name}
                    className="size-24 rounded-xl border border-[#30313D] bg-[#171821] object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-white">
                      {item.name}
                    </h2>

                    <p className="mt-1 text-sm text-[#91B5D9]">
                      {formatPrice(item.price)} per item
                    </p>

                    <p className="mt-2 font-bold text-[#A5E2DB]">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">

                    <div className="flex items-center rounded-lg border border-[#30313D] bg-[#171821]">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, -1)}
                        aria-label={`Decrease ${item.name} quantity`}
                        className="rounded-l-lg p-2 text-[#91B5D9] transition hover:bg-[#30313D] hover:text-[#A5E2DB]"
                      >
                        <Minus size={15} />
                      </button>

                      <span className="min-w-8 text-center text-sm font-semibold text-white">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, 1)}
                        aria-label={`Increase ${item.name} quantity`}
                        className="rounded-r-lg p-2 text-[#91B5D9] transition hover:bg-[#30313D] hover:text-[#A5E2DB]"
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item._id)}
                      className="inline-flex items-center gap-1 text-sm text-red-400 transition hover:text-red-300"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </section>

            <aside className="rounded-2xl border border-[#30313D] bg-[#20212B] p-5 sm:p-6">
              <h2 className="text-lg font-bold text-white">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between text-[#91B5D9]">
                  <span>Subtotal</span>
                  <span className="text-white">
                    {formatPrice(subtotal)}
                  </span>
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
                    <span className="text-[#A5E2DB]">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  alert("Connect this button to your checkout flow.")
                }
                className="mt-6 w-full rounded-xl bg-[#A5E2DB] px-4 py-3 font-semibold text-[#171821] transition hover:bg-[#8BD4CB] active:scale-[0.99]"
              >
                Proceed to Checkout
              </button>

              <p className="mt-4 text-center text-xs text-[#91B5D9]/70">
                Shipping and final charges are confirmed at checkout.
              </p>
            </aside>

          </div>
        )}
      </div>
    </div>
  );
}