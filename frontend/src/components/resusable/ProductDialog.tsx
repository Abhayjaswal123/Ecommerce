import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";

import {
    createProduct,
    updateProduct,
    type Product,
    type ProductCategory,
    type ProductInput,
} from "@/api/product";
import { Button } from "@/components/ui/button";
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

export const productCategories: ProductCategory[] = [
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

type ProductVariantForm = {
    size: string;
    color: string;
    img: string;
    price: string;
    quantity: string;
};

type ProductForm = {
    name: string;
    description: string;
    category: string;
    variants: ProductVariantForm[];
};

const emptyVariant: ProductVariantForm = {
    size: "",
    color: "",
    img: "",
    price: "",
    quantity: "",
};

const emptyForm: ProductForm = {
    name: "",
    description: "",
    category: "",
    variants: [{ ...emptyVariant }],
};

const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError<{ message?: string }>(error)) {
        return error.response?.data?.message ?? error.message;
    }
    return error instanceof Error ? error.message : "An unexpected error occurred.";
};

type ProductDialogProps = {
    open: boolean;
    editingProduct: Product | null;
    onOpenChange: (open: boolean) => void;
    onSaved: () => void | Promise<void>;
};

export default function ProductDialog({
    open,
    editingProduct,
    onOpenChange,
    onSaved,
}: ProductDialogProps) {
    const [form, setForm] = useState<ProductForm>(emptyForm);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;

        setFormError("");

        setForm(
            editingProduct
                ? {
                    name: editingProduct.name,
                    description: editingProduct.description,
                    category: editingProduct.category,
                    variants: (Array.isArray(editingProduct.variants)
                        ? editingProduct.variants
                        : []).map((variant) => ({
                        size: variant.size ?? "",
                        color: variant.color,
                        img: variant.img ?? "",
                        price: String(variant.price),
                        quantity: String(variant.quantity),
                    })),
                }
                : {
                    ...emptyForm,
                    variants: [{ ...emptyVariant }],
                }
        );
    }, [open, editingProduct]);

    const addVariant = () => {
        setForm((prev) => ({
            ...prev,
            variants: [...prev.variants, { ...emptyVariant }],
        }));
    };

    const removeVariant = (index: number) => {
        setForm((prev) => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index),
        }));
    };

    const updateVariant = (
        index: number,
        field: keyof ProductVariantForm,
        value: string
    ) => {
        setForm((prev) => ({
            ...prev,
            variants: prev.variants.map((variant, i) =>
                i === index ? { ...variant, [field]: value } : variant
            ),
        }));
    };

    const handleSaveProduct = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError("");

        const category = productCategories.find(
            (option) => option === form.category
        );

        if (!category) {
            setFormError("Choose a product category.");
            return;
        }

        if (form.variants.length === 0) {
            setFormError("Add at least one product variant.");
            return;
        }

        const invalidVariant = form.variants.some(
            (variant) =>
                !variant.color.trim() ||
                variant.price === "" ||
                variant.quantity === "" ||
                !Number.isFinite(Number(variant.price)) ||
                !Number.isFinite(Number(variant.quantity)) ||
                Number(variant.price) < 0 ||
                Number(variant.quantity) < 0 ||
                !Number.isInteger(Number(variant.quantity))
        );

        if (invalidVariant) {
            setFormError("Please enter valid details for all variants.");
            return;
        }

        const productInput: ProductInput = {
            name: form.name.trim(),
            description: form.description.trim(),
            category,
            variants: form.variants.map((variant) => ({
                size: variant.size.trim(),
                color: variant.color.trim(),
                img: variant.img.trim(),
                price: Number(variant.price),
                quantity: Number(variant.quantity),
            })),
        };

        setSaving(true);

        try {
            if (editingProduct) {
                await updateProduct(editingProduct._id, productInput);
            } else {
                await createProduct(productInput);
            }

            onOpenChange(false);
            await onSaved();
        } catch (error) {
            setFormError(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                        <label htmlFor="product-name" className="text-sm leading-none font-medium">
                            Product Name *
                        </label>
                        <Input
                            id="product-name"
                            required
                            value={form.name}
                            onChange={(event) => setForm({ ...form, name: event.target.value })}
                            placeholder="Enter product name"
                            className="border-white/10 bg-[#171821]"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="product-description" className="text-sm leading-none font-medium">
                            Description
                        </label>
                        <Textarea
                            id="product-description"
                            value={form.description}
                            onChange={(event) =>
                                setForm({ ...form, description: event.target.value })
                            }
                            placeholder="Describe your product"
                            className="border-white/10 bg-[#171821]"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="product-category" className="text-sm leading-none font-medium">
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
                                {productCategories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">

                        {/* Variants Header */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">
                                Product Variants
                            </h3>

                            <Button
                                type="button"
                                onClick={addVariant}
                                className="bg-[#a5e0d9] text-[#171821] hover:bg-[#8bd5cc]"
                            >
                                + Add Variant
                            </Button>
                        </div>

                        {/* Variants */}
                        {form.variants.map((variant, index) => (
                            <div
                                key={index}
                                className="space-y-4 rounded-xl border border-white/10 bg-[#171821] p-4"
                            >
                                {/* Variant Heading */}
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-slate-300">
                                        Variant {index + 1}
                                    </h4>

                                    {form.variants.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeVariant(index)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>

                                {/* Size and Color */}
                                <div className="grid grid-cols-2 gap-3">

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Size
                                        </label>

                                        <Input
                                            value={variant.size}
                                            onChange={(event) =>
                                                updateVariant(index, "size", event.target.value)
                                            }
                                            placeholder="S, M, L, XL"
                                            className="border-white/10 bg-[#20212b]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Color *
                                        </label>

                                        <Input
                                            required
                                            value={variant.color}
                                            onChange={(event) =>
                                                updateVariant(index, "color", event.target.value)
                                            }
                                            placeholder="Black"
                                            className="border-white/10 bg-[#20212b]"
                                        />
                                    </div>
                                </div>

                                {/* Price and Stock */}
                                <div className="grid grid-cols-2 gap-3">

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Price (₹) *
                                        </label>

                                        <Input
                                            required
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={variant.price}
                                            onChange={(event) =>
                                                updateVariant(index, "price", event.target.value)
                                            }
                                            placeholder="Enter price"
                                            className="border-white/10 bg-[#20212b]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">
                                            Stock Quantity *
                                        </label>

                                        <Input
                                            required
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={variant.quantity}
                                            onChange={(event) =>
                                                updateVariant(index, "quantity", event.target.value)
                                            }
                                            placeholder="Available quantity"
                                            className="border-white/10 bg-[#20212b]"
                                        />
                                    </div>
                                </div>

                                {/* Image URL */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Variant Image URL
                                    </label>

                                    <Input
                                        type="url"
                                        value={variant.img}
                                        onChange={(event) =>
                                            updateVariant(index, "img", event.target.value)
                                        }
                                        placeholder="https://example.com/product.jpg"
                                        className="border-white/10 bg-[#20212b]"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
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
    );
}
