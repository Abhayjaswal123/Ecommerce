import { ImagePlus, Pencil, Trash2 } from "lucide-react";
import type { Product } from "@/api/product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const currency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

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

export default InventoryProductCard;
