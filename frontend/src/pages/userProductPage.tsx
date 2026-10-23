import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Heart,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Package,
  Search,
  ShoppingCart,
  Plus,
  Minus,
} from "lucide-react";

import {
  Link,
  Navigate,
  useParams,
} from "react-router";

import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
  type CartResponse,
} from "@/api/cart";
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

const productSections = {
  top: {
    title: "Top Products",
    description: "Explore popular products.",
  },
  liked: {
    title: "Liked Products",
    description: "Products you and other customers love.",
  },
  all: {
    title: "All Products",
    description: "Browse our complete collection.",
  },
} as const;

const PAGE_SIZE = 10;
const SECTION_PREVIEW_SIZE = 4;

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

const getCartQuantities = (response: CartResponse) => {
  const quantities: Record<string, number> = {};

  for (const item of response.cart?.items ?? []) {
    if (item.product) {
      quantities[item.product._id] = item.quantity;
    }
  }

  return quantities;
};

export default function UserProducts() {
  const { section } = useParams<{ section?: string }>();
  const activeSection =
    section === "top" || section === "liked" || section === "all"
      ? section
      : null;
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

  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartLoaded, setCartLoaded] = useState(false);
  const [updatingCart, setUpdatingCart] = useState(false);
  const [updatingCartAction, setUpdatingCartAction] = useState<{
    key: string;
    type: "add" | "remove";
  } | null>(null);
  const [pagination, setPagination] = useState({ key: "", page: 1 });

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

  const sectionProducts =
    activeSection === "top"
      ? [...topProducts].sort(
          (first, second) => (second.likesCount ?? 0) - (first.likesCount ?? 0),
        )
      : activeSection === "liked"
        ? [...likedProducts].sort(
            (first, second) =>
              (second.likesCount ?? 0) - (first.likesCount ?? 0),
          )
        : products;
  const totalPages = Math.max(1, Math.ceil(sectionProducts.length / PAGE_SIZE));
  const paginationKey = `${activeSection ?? "overview"}:${JSON.stringify(filters)}`;
  const currentPage =
    pagination.key === paginationKey
      ? Math.min(pagination.page, totalPages)
      : 1;
  const paginatedProducts = sectionProducts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
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

  useEffect(() => {
    let active = true;

    const loadCart = async () => {
      try {
        const response = await getCart();
        if (active) setCart(getCartQuantities(response.data));
      } catch (error) {
        if (active) setPageError(getErrorMessage(error));
      } finally {
        if (active) setCartLoaded(true);
      }
    };

    void loadCart();

    return () => {
      active = false;
    };
  }, []);

  const addToCart = async (product: Product, key: string) => {
    if (
      !cartLoaded ||
      updatingCart ||
      product.quantity <= (cart[product._id] ?? 0)
    ) {
      return;
    }

    setUpdatingCart(true);
    setUpdatingCartAction({ key, type: "add" });
    setPageError("");

    try {
      const response = await addCartItem(product._id);
      setCart(getCartQuantities(response.data));
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setUpdatingCart(false);
      setUpdatingCartAction(null);
    }
  };

  const removeFromCart = async (productId: string, key: string) => {
    if (!cartLoaded || updatingCart) return;

    setUpdatingCart(true);
    setUpdatingCartAction({ key, type: "remove" });
    setPageError("");

    try {
      const quantity = cart[productId] ?? 0;
      const response =
        quantity <= 1
          ? await removeCartItem(productId)
          : await updateCartItem(productId, quantity - 1);
      setCart(getCartQuantities(response.data));
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setUpdatingCart(false);
      setUpdatingCartAction(null);
    }
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
          .sort((first, second) => (second.likesCount ?? 0) - (first.likesCount ?? 0)),
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

  if (section && !activeSection) {
    return <Navigate to="/products" replace />;
  }

  return (
    <div className="min-h-screen bg-[#171821] p-4 text-slate-100 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-8">

        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {activeSection ? productSections[activeSection].title : "Shop Products"}
            </h1>
            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              {activeSection
                ? productSections[activeSection].description
                : "Discover products and add your favorites to your cart."}
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

        {activeSection ? (
          <>
            <Link
              to="/products"
              className="inline-flex items-center rounded-lg border border-white/10 bg-[#20212b] px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Back to products
            </Link>
            <ProductSection
              title={productSections[activeSection].title}
              description={productSections[activeSection].description}
              products={paginatedProducts}
              loading={loading}
              cart={cart}
              cartReady={cartLoaded}
              cartUpdating={updatingCart}
              updatingCartAction={updatingCartAction}
              onAddToCart={addToCart}
              onRemoveFromCart={removeFromCart}
              likingProducts={likingProducts}
              onToggleLike={toggleLike}
            />
            {!loading && sectionProducts.length > 0 && (
              <nav
                aria-label="Product pagination"
                className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-5 sm:flex-row"
              >
                <p className="text-sm text-slate-400" aria-live="polite">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, sectionProducts.length)} of{" "}
                  {sectionProducts.length}
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setPagination({ key: paginationKey, page: currentPage - 1 })
                    }
                    className="border-white/10 bg-[#20212b] text-white hover:bg-white/10"
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-slate-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setPagination({ key: paginationKey, page: currentPage + 1 })
                    }
                    className="border-white/10 bg-[#20212b] text-white hover:bg-white/10"
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </nav>
            )}
          </>
        ) : (
          <>
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
            products={topProducts.slice(0, SECTION_PREVIEW_SIZE)}
            loading={loading}
            cart={cart}
            cartReady={cartLoaded}
            cartUpdating={updatingCart}
            updatingCartAction={updatingCartAction}
            viewAllHref="/products/top"
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
            likingProducts={likingProducts}
            onToggleLike={toggleLike}
          />

          <ProductSection
            title="Liked Products"
            description="Products you and other customers love."
            products={likedProducts.slice(0, SECTION_PREVIEW_SIZE)}
            loading={loading}
            cart={cart}
            cartReady={cartLoaded}
            cartUpdating={updatingCart}
            updatingCartAction={updatingCartAction}
            viewAllHref="/products/liked"
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
            likingProducts={likingProducts}
            onToggleLike={toggleLike}
          />

          <ProductSection
            title="All Products"
            description="Browse our complete collection."
            products={products.slice(0, SECTION_PREVIEW_SIZE)}
            loading={loading}
            cart={cart}
            cartReady={cartLoaded}
            cartUpdating={updatingCart}
            updatingCartAction={updatingCartAction}
            viewAllHref="/products/all"
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
            likingProducts={likingProducts}
            onToggleLike={toggleLike}
          />
        </div>
          </>
        )}
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
  cartReady,
  cartUpdating,
  updatingCartAction,
  viewAllHref,
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
  cartReady: boolean;
  cartUpdating: boolean;
  updatingCartAction: { key: string; type: "add" | "remove" } | null;
  viewAllHref?: string;
  onAddToCart: (product: Product, key: string) => void;
  onRemoveFromCart: (productId: string, key: string) => void;
  likingProducts: Record<string, boolean>;
  onToggleLike: (product: Product) => void;
}) {
  return (
    <section className="space-y-5">
      <div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          </div>
          {viewAllHref && (
            <Link
              to={viewAllHref}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#a5e0d9] transition hover:bg-white/5 hover:text-white"
            >
              See all
              <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
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
            const cartActionKey = `${title}:${product._id}`;
            const isAdding =
              updatingCartAction?.key === cartActionKey &&
              updatingCartAction.type === "add";
            const isRemoving =
              updatingCartAction?.key === cartActionKey &&
              updatingCartAction.type === "remove";

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
                        disabled={!cartReady || cartUpdating}
                        onClick={() =>
                          void onRemoveFromCart(product._id, cartActionKey)
                        }
                        className="border-white/10 bg-transparent text-white hover:bg-white/10"
                      >
                        {isRemoving ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          <Minus className="size-4" />
                        )}
                      </Button>

                      <span className="flex-1 text-center text-sm font-semibold">
                        {inCart} in cart
                      </span>

                      <Button
                        type="button"
                        variant="outline"
                        aria-label={`Add one ${product.name} to cart`}
                        disabled={!cartReady || cartUpdating || cartLimitReached}
                        onClick={() => void onAddToCart(product, cartActionKey)}
                        className="border-white/10 bg-transparent text-white hover:bg-white/10"
                      >
                        {isAdding ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          <Plus className="size-4" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      disabled={!cartReady || cartUpdating || outOfStock}
                      onClick={() => void onAddToCart(product, cartActionKey)}
                      className="h-11 w-full gap-2 bg-[#a5e0d9] font-semibold text-[#171821] hover:bg-[#8bd5cc] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isAdding ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <ShoppingCart className="size-4" />
                      )}
                      {isAdding
                        ? "Adding..."
                        : outOfStock
                        ? "Out of Stock"
                        : cartReady
                          ? "Add to Cart"
                          : "Loading Cart..."}
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
