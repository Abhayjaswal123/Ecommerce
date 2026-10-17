import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import {
    Boxes,
    ImagePlus,
    Package,
    Pencil,
    Plus,
    Search,
    Trash2,
} from "lucide-react";

import {
    createProduct,
    deleteProduct,
    getVendorProducts,
    type Product,
    type ProductCategory,
    type ProductFilters,
    type ProductInput,
    updateProduct,
} from "@/api/product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
const stockFilters = ["all", "in-stock", "low-stock", "out-of-stock"] as const;
const categoryOptions: Array<ProductCategory | "All"> = ["All", ...categories];

type ProductForm = {
    name: string;
    img: string;
    description: string;
    price: string;
    quantity: string;
    category: string;
};

const emptyForm: ProductForm = {
    name: "",
    img: "",
    description: "",
    price: "",
    quantity: "",
    category: "",
};

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
    return error instanceof Error ? error.message : "An unexpected error occurred.";
};

export default function VendorProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<"All" | ProductCategory>("All");
    const [stockFilter, setStockFilter] = useState<
        "all" | NonNullable<ProductFilters["stock"]>
    >("all");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState<ProductForm>(emptyForm);
    const [formError, setFormError] = useState("");
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [saving, setSaving] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [deleting, setDeleting] = useState(false);

    const filters = useMemo<ProductFilters>(() => ({
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(categoryFilter !== "All"
            ? { category: categoryFilter }
            : {}),
        ...(stockFilter !== "all"
            ? { stock: stockFilter }
            : {}),
    }), [categoryFilter, search, stockFilter]);

    const loadProducts = useCallback(async (productFilters: ProductFilters) => {
        setLoading(true);
        setPageError("");
        try {
            const response = await getVendorProducts(productFilters);
            setProducts(response.data.products);
        } catch (error) {
            setPageError(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let active = true;
        const timer = window.setTimeout(async () => {
            setLoading(true);
            setPageError("");
            try {
                const response = await getVendorProducts(filters);
                if (active) setProducts(response.data.products);
            } catch (error) {
                if (active) setPageError(getErrorMessage(error));
            } finally {
                if (active) setLoading(false);
            }
        }, search.trim() ? 300 : 0);

        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [filters, search]);

    const totalStock = products.reduce(
        (total, product) => total + product.quantity,
        0,
    );
    const inventoryValue = products.reduce(
        (total, product) => total + product.price * product.quantity,
        0,
    );

    const openCreateDialog = () => {
        setEditingProduct(null);
        setForm(emptyForm);
        setFormError("");
        setDialogOpen(true);
    };

    const openEditDialog = (product: Product) => {
        setEditingProduct(product);
        setForm({
            name: product.name,
            img: product.img,
            description: product.description,
            price: String(product.price),
            quantity: String(product.quantity),
            category: product.category,
        });
        setFormError("");
        setDialogOpen(true);
    };

    const handleDialogChange = (open: boolean) => {
        setDialogOpen(open);
        if (!open) {
            setEditingProduct(null);
            setForm(emptyForm);
            setFormError("");
        }
    };

    const handleSaveProduct = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError("");

        const category = categories.find((option) => option === form.category);
        if (!category) {
            setFormError("Choose a product category.");
            return;
        }

        const productInput: ProductInput = {
            name: form.name.trim(),
            img: form.img.trim(),
            description: form.description.trim(),
            price: Number(form.price),
            quantity: Number(form.quantity),
            category,
        };

        setSaving(true);
        try {
            if (editingProduct) {
                await updateProduct(editingProduct._id, productInput);
            } else {
                await createProduct(productInput);
            }
            setDialogOpen(false);
            setEditingProduct(null);
            setForm(emptyForm);
            await loadProducts(filters);
        } catch (error) {
            setFormError(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProduct = async () => {
        if (!productToDelete) {
            return;
        }

        setDeleting(true);
        setPageError("");
        try {
            await deleteProduct(productToDelete._id);
            setProductToDelete(null);
            await loadProducts(filters);
        } catch (error) {
            setPageError(getErrorMessage(error));
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#171821] p-4 text-slate-100 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1500px] space-y-8">
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            My Products
                        </h1>
                        <p className="mt-2 text-sm text-slate-400 sm:text-base">
                            Manage your products and inventory.
                        </p>
                    </div>
                    <Button
                        onClick={openCreateDialog}
                        className="h-11 gap-2 bg-[#a5e0d9] font-semibold text-[#171821] hover:bg-[#8bd5cc]"
                    >
                        <Plus className="size-5" />
                        Add Product
                    </Button>
                </header>

                {pageError && (
                    <div
                        role="alert"
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                    >
                        {pageError}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <SummaryCard
                        title="Total Products"
                        value={products.length.toLocaleString("en-IN")}
                        icon={<Package className="size-6 text-[#a5e0d9]" />}
                    />
                    <SummaryCard
                        title="Total Units in Stock"
                        value={totalStock.toLocaleString("en-IN")}
                        icon={<Boxes className="size-6 text-sky-400" />}
                    />
                    <SummaryCard
                        title="Inventory Value"
                        value={currency(inventoryValue)}
                        icon={<Package className="size-6 text-purple-400" />}
                    />
                </div>

                <section className="space-y-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-md">
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
                                const selectedFilter = stockFilters.find(
                                    (filter) => filter === value,
                                );
                                if (selectedFilter) setStockFilter(selectedFilter);
                            }}
                        >
                            <SelectTrigger className="h-11 w-full border-white/10 bg-[#20212b] text-white lg:w-[210px]">
                                <SelectValue placeholder="Filter by stock" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Stock Levels</SelectItem>
                                <SelectItem value="in-stock">In Stock</SelectItem>
                                <SelectItem value="low-stock">Low Stock</SelectItem>
                                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-white">
                            Shop by Category
                        </h2>
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
                    </div>
                </section>

                <Card className="overflow-hidden rounded-2xl border-white/10 bg-[#20212b] text-white shadow-sm">
                    <CardContent className="p-4 sm:p-6">
                        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    All Products
                                </h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Manage pricing, stock, and product details.
                                </p>
                            </div>
                            <Badge className="w-fit border-0 bg-white/10 text-slate-200">
                                {products.length} products
                            </Badge>
                        </div>

                        {loading ? (
                            <p className="py-10 text-center text-slate-400">
                                Loading your products...
                            </p>
                        ) : products.length === 0 ? (
                            <p className="py-10 text-center text-slate-400">
                                {pageError
                                    ? "Unable to load products."
                                    : products.length === 0
                                    ? "You have not added any products yet."
                                    : "No products match your search and filters."}
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                {products.map((product) => (
                                    <InventoryProductCard
                                        key={product._id}
                                        product={product}
                                        onEdit={() => openEditDialog(product)}
                                        onDelete={() => setProductToDelete(product)}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
                    <DialogContent className="border-white/10 bg-[#20212b] text-white sm:max-w-[560px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingProduct ? "Edit Product" : "Add New Product"}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Enter the product details below.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSaveProduct} className="space-y-5">
                            {formError && (
                                <div
                                    role="alert"
                                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                                >
                                    {formError}
                                </div>
                            )}
                            <div className="space-y-2">
                                <label
                                    htmlFor="product-name"
                                    className="text-sm leading-none font-medium"
                                >
                                    Product Name *
                                </label>
                                <Input
                                    id="product-name"
                                    required
                                    value={form.name}
                                    onChange={(event) =>
                                        setForm({ ...form, name: event.target.value })
                                    }
                                    placeholder="Enter product name"
                                    className="border-white/10 bg-[#171821]"
                                />
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="product-description"
                                    className="text-sm leading-none font-medium"
                                >
                                    Description
                                </label>
                                <Textarea
                                    id="product-description"
                                    value={form.description}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            description: event.target.value,
                                        })
                                    }
                                    placeholder="Describe your product"
                                    className="border-white/10 bg-[#171821]"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="product-category"
                                        className="text-sm leading-none font-medium"
                                    >
                                        Category *
                                    </label>
                                    <Select
                                        value={form.category || null}
                                        onValueChange={(value) =>
                                            setForm({ ...form, category: value ?? "" })
                                        }
                                    >
                                        <SelectTrigger
                                            id="product-category"
                                            className="border-white/10 bg-[#171821]"
                                        >
                                            <SelectValue placeholder="Choose category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="product-price"
                                        className="text-sm leading-none font-medium"
                                    >
                                        Price (₹) *
                                    </label>
                                    <Input
                                        id="product-price"
                                        required
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.price}
                                        onChange={(event) =>
                                            setForm({ ...form, price: event.target.value })
                                        }
                                        placeholder="Enter price"
                                        className="border-white/10 bg-[#171821]"
                                    />
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <label
                                        htmlFor="product-quantity"
                                        className="text-sm leading-none font-medium"
                                    >
                                        Stock Quantity *
                                    </label>
                                    <Input
                                        id="product-quantity"
                                        required
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={form.quantity}
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                quantity: event.target.value,
                                            })
                                        }
                                        placeholder="Enter available quantity"
                                        className="border-white/10 bg-[#171821]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="product-image"
                                    className="text-sm leading-none font-medium"
                                >
                                    Image URL
                                </label>
                                <Input
                                    id="product-image"
                                    type="url"
                                    value={form.img}
                                    onChange={(event) =>
                                        setForm({ ...form, img: event.target.value })
                                    }
                                    placeholder="https://example.com/product.jpg"
                                    className="border-white/10 bg-[#171821]"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleDialogChange(false)}
                                    className="border-white/10 bg-transparent text-white"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-[#a5e0d9] text-[#171821] hover:bg-[#8bd5cc]"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingProduct
                                          ? "Save Changes"
                                          : "Add Product"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <AlertDialog
                    open={productToDelete !== null}
                    onOpenChange={(open) => {
                        if (!open && !deleting) setProductToDelete(null);
                    }}
                >
                    <AlertDialogContent className="border-white/10 bg-[#20212b] text-white">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <Trash2 className="size-5 text-red-400" />
                                Delete Product?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400">
                                {productToDelete
                                    ? `Delete "${productToDelete.name}"? This action cannot be undone.`
                                    : "This action cannot be undone."}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                disabled={deleting}
                                className="border-white/10 bg-transparent text-white"
                            >
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                disabled={deleting}
                                onClick={(event) => {
                                    event.preventDefault();
                                    void handleDeleteProduct();
                                }}
                                className="bg-red-500 text-white hover:bg-red-600"
                            >
                                {deleting ? "Deleting..." : "Delete Product"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}

function InventoryProductCard({
    product,
    onEdit,
    onDelete,
}: {
    product: Product;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const stockLabel =
        product.quantity === 0
            ? "Out of Stock"
            : product.quantity <= 5
              ? "Low Stock"
              : "In Stock";

    return (
        <article className="group overflow-hidden rounded-xl border border-white/[0.08] bg-[#171821] transition-colors hover:border-white/20">
            <div className="relative flex h-48 items-center justify-center overflow-hidden bg-[#252633]">
                {product.img ? (
                    <img
                        src={product.img}
                        alt={product.name}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <ImagePlus className="size-12 text-slate-500" />
                )}
                <Badge
                    className={`absolute right-3 top-3 border-0 ${
                        product.quantity === 0
                            ? "bg-red-500/15 text-red-400"
                            : product.quantity <= 5
                              ? "bg-amber-500/15 text-amber-400"
                              : "bg-emerald-500/15 text-emerald-400"
                    }`}
                >
                    {stockLabel}
                </Badge>
            </div>

            <div className="space-y-4 p-4">
                <div>
                    <p className="text-xs font-medium text-[#a5e0d9]">
                        {product.category}
                    </p>
                    <h3 className="mt-1 truncate text-lg font-semibold text-white">
                        {product.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 min-h-10 text-sm text-slate-400">
                        {product.description || "No description provided."}
                    </p>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-white/[0.08] pt-4">
                    <div>
                        <p className="text-xl font-bold text-white">
                            {currency(product.price)}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                            Stock: {product.quantity} units
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label={`Edit ${product.name}`}
                            onClick={onEdit}
                            className="size-9 border-white/10 bg-[#252633] text-slate-200 hover:bg-white/10 hover:text-white"
                        >
                            <Pencil className="size-4" />
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label={`Delete ${product.name}`}
                            onClick={onDelete}
                            className="size-9 border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 hover:text-red-300"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </article>
    );
}

function SummaryCard({
    title,
    value,
    icon,
}: {
    title: string;
    value: string;
    icon: React.ReactNode;
}) {
    return (
        <Card className="rounded-2xl border-white/10 bg-[#20212b] text-white shadow-sm">
            <CardContent className="flex items-center justify-between gap-3 p-5">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-400">{title}</p>
                    <p className="mt-2 truncate text-2xl font-bold sm:text-3xl">
                        {value}
                    </p>
                </div>
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#30313d]">
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}
