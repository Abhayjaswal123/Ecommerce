
import { useMemo, useState, type FormEvent } from "react";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Package,
    Boxes,
    AlertTriangle,
    ImagePlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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

type Product = {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    stock: number;
    image: string;
};

const initialProducts: Product[] = [
    {
        id: "1",
        name: "Premium Headphones",
        description: "Wireless headphones with premium sound.",
        category: "Electronics",
        price: 2499,
        stock: 25,
        image:
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    },
    {
        id: "2",
        name: "Classic Wristwatch",
        description: "Elegant everyday wristwatch.",
        category: "Accessories",
        price: 1899,
        stock: 12,
        image:
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    },
    {
        id: "3",
        name: "Casual Sneakers",
        description: "Comfortable sneakers for everyday use.",
        category: "Fashion",
        price: 1599,
        stock: 0,
        image:
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    },
    {
        id: "4",
        name: "Modern Backpack",
        description: "Spacious backpack for work and travel.",
        category: "Accessories",
        price: 999,
        stock: 4,
        image:
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
    },
];

const emptyForm = {
    name: "",
    description: "",
    category: "Electronics",
    price: "",
    stock: "",
    image: "",
};

type ProductForm = typeof emptyForm;

const categories = [
    "Electronics",
    "Fashion",
    "Home & Living",
    "Accessories",
    "Beauty",
    "Other",
];

export default function VendorProducts() {
    const [products, setProducts] =
        useState<Product[]>(initialProducts);

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [form, setForm] = useState<ProductForm>(emptyForm);
    const [error, setError] = useState("");

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesSearch =
                product.name.toLowerCase().includes(search.toLowerCase()) ||
                product.category.toLowerCase().includes(search.toLowerCase());

            const matchesFilter =
                filter === "all" ||
                (filter === "in-stock" && product.stock > 0) ||
                (filter === "low-stock" &&
                    product.stock > 0 &&
                    product.stock <= 5) ||
                (filter === "out-of-stock" && product.stock === 0);

            return matchesSearch && matchesFilter;
        });
    }, [products, search, filter]);

    const totalStock = products.reduce(
        (total, product) => total + product.stock,
        0
    );

    const inventoryValue = products.reduce(
        (total, product) => total + product.price * product.stock,
        0
    );

    function openAddDialog() {
        setEditingId(null);
        setForm(emptyForm);
        setError("");
        setDialogOpen(true);
    }

    function openEditDialog(product: Product) {
        setEditingId(product.id);
        setForm({
            name: product.name,
            description: product.description,
            category: product.category,
            price: String(product.price),
            stock: String(product.stock),
            image: product.image,
        });
        setError("");
        setDialogOpen(true);
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const name = form.name.trim();
        const price = Number(form.price);
        const stock = Number(form.stock);

        if (!name || !form.category || !form.price || form.stock === "") {
            setError("Please complete all required fields.");
            return;
        }

        if (
            !Number.isFinite(price) ||
            price <= 0 ||
            !Number.isInteger(stock) ||
            stock < 0
        ) {
            setError("Enter a valid price and a whole-number stock quantity.");
            return;
        }

        const productData = {
            name,
            description: form.description.trim(),
            category: form.category,
            price,
            stock,
            image: form.image.trim(),
        };

        if (editingId) {
            setProducts((current) =>
                current.map((product) =>
                    product.id === editingId
                        ? { ...product, ...productData }
                        : product
                )
            );
        } else {
            setProducts((current) => [
                {
                    id: crypto.randomUUID(),
                    ...productData,
                },
                ...current,
            ]);
        }

        setDialogOpen(false);
        setForm(emptyForm);
        setEditingId(null);
        setError("");
    }

    function handleDelete() {
        if (!deleteId) return;

        setProducts((current) =>
            current.filter((product) => product.id !== deleteId)
        );

        setDeleteId(null);
    }

    const currency = (amount: number) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(amount);

    return (
        <div className="min-h-screen bg-[#171821] p-4 text-slate-100 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1500px] space-y-7">

                {/* Header */}
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                            My Products
                        </h1>
                        <p className="mt-2 text-sm text-slate-400 sm:text-base">
                            Manage your products, pricing and inventory.
                        </p>
                    </div>

                    <Button
                        onClick={openAddDialog}
                        className="h-11 gap-2 bg-[#a5e0d9] font-semibold text-[#171821] hover:bg-[#8bd5cc]"
                    >
                        <Plus className="size-5" />
                        Add Product
                    </Button>
                </header>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <SummaryCard
                        title="Total Products"
                        value={products.length.toString()}
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

                {/* Product List */}
                <Card className="overflow-hidden rounded-2xl border-white/10 bg-[#20212b] text-white shadow-sm">
                    <CardContent className="p-4 sm:p-6">

                        {/* Search and Filters */}
                        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="relative w-full lg:max-w-sm">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search products..."
                                    className="h-11 border-white/10 bg-[#171821] pl-10 text-white placeholder:text-slate-500"
                                />
                            </div>

                            <Select
                                value={filter}
                                onValueChange={(value) => setFilter(value ?? "all")}
                            >
                                <SelectTrigger className="h-11 w-full border-white/10 bg-[#171821] text-white lg:w-[200px]">
                                    <SelectValue placeholder="Filter products" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="all">All Products</SelectItem>
                                    <SelectItem value="in-stock">In Stock</SelectItem>
                                    <SelectItem value="low-stock">Low Stock</SelectItem>
                                    <SelectItem value="out-of-stock">
                                        Out of Stock
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Product Grid */}
                        {filteredProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Package className="mb-4 size-12 text-slate-500" />
                                <h3 className="text-lg font-semibold text-white">
                                    No products found
                                </h3>
                                <p className="mt-2 text-sm text-slate-400">
                                    Try another search or add a new product.
                                </p>
                                <Button
                                    onClick={openAddDialog}
                                    variant="outline"
                                    className="mt-5 border-white/10 bg-transparent text-white hover:bg-white/5"
                                >
                                    <Plus className="mr-2 size-4" />
                                    Add Product
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                {filteredProducts.map((product) => (
                                    <article
                                        key={product.id}
                                        className="group overflow-hidden rounded-xl border border-white/[0.08] bg-[#171821] transition-colors hover:border-white/20"
                                    >
                                        {/* Image */}
                                        <div className="relative flex h-48 items-center justify-center overflow-hidden bg-[#252633]">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <ImagePlus className="size-12 text-slate-500" />
                                            )}

                                            <Badge
                                                className={`absolute right-3 top-3 border-0 ${product.stock === 0
                                                        ? "bg-red-500/15 text-red-400"
                                                        : product.stock <= 5
                                                            ? "bg-amber-500/15 text-amber-400"
                                                            : "bg-emerald-500/15 text-emerald-400"
                                                    }`}
                                            >
                                                {product.stock === 0
                                                    ? "Out of Stock"
                                                    : product.stock <= 5
                                                        ? "Low Stock"
                                                        : "In Stock"}
                                            </Badge>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-4 p-4">
                                            <div>
                                                <p className="text-xs font-medium text-[#a5e0d9]">
                                                    {product.category}
                                                </p>

                                                <h3 className="mt-1 truncate text-lg font-semibold text-white">
                                                    {product.name}
                                                </h3>

                                                <p className="mt-1 line-clamp-2 min-h-10 text-sm text-slate-400">
                                                    {product.description || "No description added."}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between gap-2 border-t border-white/[0.08] pt-4">
                                                <div>
                                                    <p className="text-xl font-bold text-white">
                                                        {currency(product.price)}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Stock: {product.stock} units
                                                    </p>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        aria-label={`Edit ${product.name}`}
                                                        onClick={() => openEditDialog(product)}
                                                        className="size-9 border-white/10 bg-[#252633] text-slate-200 hover:bg-white/10 hover:text-white"
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Button>

                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        aria-label={`Delete ${product.name}`}
                                                        onClick={() => setDeleteId(product.id)}
                                                        className="size-9 border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 hover:text-red-300"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add / Edit Dialog */}
            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) setError("");
                }}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#20212b] text-white sm:max-w-[560px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            {editingId ? "Edit Product" : "Add New Product"}
                        </DialogTitle>

                        <DialogDescription className="text-slate-400">
                            {editingId
                                ? "Update your product details below."
                                : "Enter the details for your new product."}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-5 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="product-name">Product Name *</Label>
                            <Input
                                id="product-name"
                                value={form.name}
                                onChange={(event) =>
                                    setForm({ ...form, name: event.target.value })
                                }
                                placeholder="Enter product name"
                                required
                                className="border-white/10 bg-[#171821]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product-description">Description</Label>
                            <Textarea
                                id="product-description"
                                value={form.description}
                                onChange={(event) =>
                                    setForm({ ...form, description: event.target.value })
                                }
                                placeholder="Describe your product"
                                className="min-h-24 resize-y border-white/10 bg-[#171821]"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Category *</Label>
                                <Select
                                    value={form.category}
                                    onValueChange={(value) =>
                                        setForm({
                                            ...form,
                                            category: value ?? form.category,
                                        })
                                    }
                                >
                                    <SelectTrigger className="border-white/10 bg-[#171821]">
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
                                <Label htmlFor="product-price">Price (₹) *</Label>
                                <Input
                                    id="product-price"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={form.price}
                                    onChange={(event) =>
                                        setForm({ ...form, price: event.target.value })
                                    }
                                    placeholder="999"
                                    required
                                    className="border-white/10 bg-[#171821]"
                                />
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="product-stock">Stock Quantity *</Label>
                                <Input
                                    id="product-stock"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={form.stock}
                                    onChange={(event) =>
                                        setForm({ ...form, stock: event.target.value })
                                    }
                                    placeholder="Enter available quantity"
                                    required
                                    className="border-white/10 bg-[#171821]"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product-image">Image URL</Label>
                            <Input
                                id="product-image"
                                type="url"
                                value={form.image}
                                onChange={(event) =>
                                    setForm({ ...form, image: event.target.value })
                                }
                                placeholder="https://example.com/product.jpg"
                                className="border-white/10 bg-[#171821]"
                            />
                            <p className="text-xs text-slate-500">
                                Paste a publicly accessible image URL.
                            </p>
                        </div>

                        {error && (
                            <p role="alert" className="text-sm font-medium text-red-400">
                                {error}
                            </p>
                        )}

                        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDialogOpen(false)}
                                className="border-white/10 bg-transparent text-white hover:bg-white/5"
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                className="bg-[#a5e0d9] font-semibold text-[#171821] hover:bg-[#8bd5cc]"
                            >
                                {editingId ? "Save Changes" : "Add Product"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog
                open={deleteId !== null}
                onOpenChange={(open) => {
                    if (!open) setDeleteId(null);
                }}
            >
                <AlertDialogContent className="border-white/10 bg-[#20212b] text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="size-5 text-red-400" />
                            Delete Product?
                        </AlertDialogTitle>

                        <AlertDialogDescription className="text-slate-400">
                            This will permanently remove this product from the current
                            product list. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-white/10 bg-transparent text-white hover:bg-white/5 hover:text-white">
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-500 text-white hover:bg-red-600"
                        >
                            <Trash2 className="mr-2 size-4" />
                            Delete Product
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
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
