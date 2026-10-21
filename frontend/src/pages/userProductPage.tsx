import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Heart, Package, Search, ShoppingCart, Plus, Minus } from "lucide-react";

import {
  getProducts,
  likeProduct,
  unlikeProduct,
  type Product,
  type ProductCategory,
  type ProductFilters,
  type ProductListResponse,
} from "@/api/product";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories: ProductCategory[] = [
  "Electronics",
  "Clothing",
  "Footwear",
  "Home & Kitchen",
  "Beauty",
  "Books",
  "Sports",
  "Accessories",
  "Other",
];

const categoryOptions: Array<ProductCategory | "All"> = [
  "All",
  ...categories,
];

const currency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? error.message;
  }

  return error instanceof Error
    ? error.message
    : "Something went wrong.";
};

export default function UserProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [likedProducts, setLikedProducts] = useState<Product[]>([]);
  const [likingProducts, setLikingProducts] = useState<Record<string, boolean>>({});

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<"All" | ProductCategory>("All");

  const [stockFilter, setStockFilter] =
    useState<"all" | "in-stock" | "out-of-stock">("all");

  // Local cart state. Replace with your shared cart store/API
  // when integrating the real shopping cart.
  const [cart, setCart] = useState<Record<string, number>>({});

  const cartCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0,
  );

  const filters = useMemo<ProductFilters>(
    () => ({
      ...(search.trim() ? { search: search.trim() } : {}),
      ...(categoryFilter !== "All"
        ? { category: categoryFilter }
        : {}),
      ...(stockFilter !== "all"
        ? { stock: stockFilter }
        : {}),
    }),
    [search, categoryFilter, stockFilter],
  );

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try { 
      const response = await getProducts(filters);
      const data: ProductListResponse = response.data;

      const unique = (items: Product[]) =>
        Array.from(
          new Map(
            items.map((product) => [product._id, product]),
          ).values(),
        );

      setProducts(unique(data.products));
      setTopProducts(unique(data.topProducts));
      setLikedProducts(unique(data.likedProducts));
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => void loadProducts(),
      search.trim() ? 300 : 0,
    );

    return () => window.clearTimeout(timer);
  }, [loadProducts, search]);

  const addToCart = (product: Product) => {
    if (product.quantity <= (cart[product._id] ?? 0)) return;

    setCart((previous) => ({
      ...previous,
      [product._id]: (previous[product._id] ?? 0) + 1,
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart((previous) => {
      const next = { ...previous };
      const quantity = next[productId] ?? 0;

      if (quantity <= 1) {
        delete next[productId];
      } else {
        next[productId] = quantity - 1;
      }

      return next;
    });
  };

  const toggleLike = async (product: Product) => {
    if (likingProducts[product._id]) return;

    setLikingProducts((previous) => ({ ...previous, [product._id]: true }));
    setPageError("");

    try {
      const response = product.isLiked
        ? await unlikeProduct(product._id)
        : await likeProduct(product._id);
      const { liked, likesCount } = response.data;
      const updatedProducts = products.map((item) =>
        item._id === product._id
          ? { ...item, isLiked: liked, likesCount }
          : item,
      );

      setProducts(updatedProducts);
      setLikedProducts(
        updatedProducts
          .filter((item) => (item.likesCount ?? 0) > 0)
          .sort((first, second) => (second.likesCount ?? 0) - (first.likesCount ?? 0)),
      );
      setTopProducts(
        updatedProducts
          .filter((item) => (item.likesCount ?? 0) > 0)
          .sort((first, second) => (second.likesCount ?? 0) - (first.likesCount ?? 0))
          .slice(0, 4),
      );
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLikingProducts((previous) => ({
        ...previous,
        [product._id]: false,
      }));
    }
  };

  const getCartTotal = () =>
    products.reduce(
      (total, product) =>
        total + product.price * (cart[product._id] ?? 0),
      0,
    );

  return (
    <div className="min-h-screen bg-[#171821] p-4 text-slate-100 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-8">

        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Shop Products
            </h1>
            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              Discover products and add your favorites to your cart.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#20212b] px-4 py-3">
            <ShoppingCart className="size-5 text-[#a5e0d9]" />
            <div>
              <p className="text-sm font-semibold">
                My Cart ({cartCount})
              </p>
              <p className="text-xs text-slate-400">
                {currency(getCartTotal())}
              </p>
            </div>
          </div>
        </header>

        {/* Error */}
        {pageError && (
          <div
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {pageError}
          </div>
        )}

        {/* Search and stock filter */}
        <section className="flex flex-col gap-3 sm:flex-row">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="h-11 border-white/10 bg-[#20212b] pl-10 text-white placeholder:text-slate-500"
            />
          </div>

          <Select
            value={stockFilter}
            onValueChange={(value) => {
              if (
                value === "all" ||
                value === "in-stock" ||
                value === "out-of-stock"
              ) {
                setStockFilter(value);
              }
            }}
          >
            <SelectTrigger className="h-11 w-full border-white/10 bg-[#20212b] text-white sm:w-[210px]">
              <SelectValue placeholder="Filter by stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock Levels</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </section>

        {/* Category filters */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Shop by Category</h2>

          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((category) => (
              <Button
                key={category}
                type="button"
                variant="outline"
                onClick={() => setCategoryFilter(category)}
                aria-pressed={categoryFilter === category}
                className={
                  categoryFilter === category
                    ? "border-[#a5e0d9] bg-[#a5e0d9] text-[#171821] hover:bg-[#8bd5cc]"
                    : "border-white/10 bg-[#20212b] text-slate-300 hover:bg-white/10 hover:text-white"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </section>

        {/* Product sections */}
        <div className="space-y-10">
          <ProductSection
            title="Top Products"
            description="Explore popular products."
            products={topProducts}
            loading={loading}
            cart={cart}
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
            likingProducts={likingProducts}
            onToggleLike={toggleLike}
          />

          <ProductSection
            title="Liked Products"
            description="Products you and other customers love."
            products={likedProducts}
            loading={loading}
            cart={cart}
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
            likingProducts={likingProducts}
            onToggleLike={toggleLike}
          />

          <ProductSection
            title="All Products"
            description="Browse our complete collection."
            products={products}
            loading={loading}
            cart={cart}
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
            likingProducts={likingProducts}
            onToggleLike={toggleLike}
          />
        </div>
      </div>
    </div>
  );
}

function ProductSection({
  title,
  description,
  products,
  loading,
  cart,
  onAddToCart,
  onRemoveFromCart,
  likingProducts,
  onToggleLike,
}: {
  title: string;
  description: string;
  products: Product[];
  loading: boolean;
  cart: Record<string, number>;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (productId: string) => void;
  likingProducts: Record<string, boolean>;
  onToggleLike: (product: Product) => void;
}) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>

      {loading ? (
        <p className="py-8 text-center text-slate-400">
          Loading products...
        </p>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#20212b] p-8 text-center text-slate-400">
          <Package className="mx-auto mb-3 size-8" />
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const inCart = cart[product._id] ?? 0;
            const outOfStock = product.quantity <= 0;
            const cartLimitReached = inCart >= product.quantity;

            return (
              <Card
                key={product._id}
                className="overflow-hidden rounded-2xl border-white/10 bg-[#20212b] text-white"
              >
                {/* Product image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#30313d]">
                  {product.img ? (
                    <img
                      src={product.img}
                      alt={product.name}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <Package className="size-12 text-slate-500" />
                    </div>
                  )}

                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-medium ${
                      outOfStock
                        ? "bg-red-500/90 text-white"
                        : "bg-emerald-500/90 text-white"
                    }`}
                  >
                    {outOfStock ? "Out of Stock" : "In Stock"}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    aria-label={
                      product.isLiked
                        ? `Unlike ${product.name}`
                        : `Like ${product.name}`
                    }
                    aria-pressed={product.isLiked ?? false}
                    disabled={likingProducts[product._id]}
                    onClick={() => onToggleLike(product)}
                    className="absolute left-3 top-3 gap-2 border-white/20 bg-[#171821]/80 text-white hover:bg-[#171821]"
                  >
                    <Heart
                      className={`size-4 ${
                        product.isLiked ? "fill-rose-500 text-rose-500" : ""
                      }`}
                    />
                    {product.likesCount ?? 0}
                  </Button>
                </div>

                <CardContent className="space-y-4 p-4">
                  <div>
                    <p className="text-xs font-medium text-[#a5e0d9]">
                      {product.category}
                    </p>

                    <h3 className="mt-1 line-clamp-1 text-lg font-semibold">
                      {product.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-400">
                      {product.description || "No description available."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xl font-bold text-[#a5e0d9]">
                      {currency(product.price)}
                    </span>

                    <span className="text-xs text-slate-400">
                      {product.quantity} available
                    </span>
                  </div>

                  {/* Cart controls instead of Edit/Delete */}
                  {inCart > 0 ? (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        aria-label={`Remove one ${product.name} from cart`}
                        onClick={() => onRemoveFromCart(product._id)}
                        className="border-white/10 bg-transparent text-white hover:bg-white/10"
                      >
                        <Minus className="size-4" />
                      </Button>

                      <span className="flex-1 text-center text-sm font-semibold">
                        {inCart} in cart
                      </span>

                      <Button
                        type="button"
                        variant="outline"
                        aria-label={`Add one ${product.name} to cart`}
                        disabled={cartLimitReached}
                        onClick={() => onAddToCart(product)}
                        className="border-white/10 bg-transparent text-white hover:bg-white/10"
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      disabled={outOfStock}
                      onClick={() => onAddToCart(product)}
                      className="h-11 w-full gap-2 bg-[#a5e0d9] font-semibold text-[#171821] hover:bg-[#8bd5cc] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ShoppingCart className="size-4" />
                      {outOfStock ? "Out of Stock" : "Add to Cart"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
