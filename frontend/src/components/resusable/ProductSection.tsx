import type { Product } from "@/api/product";
import { Card, CardContent } from "@/components/ui/card";
import InventoryProductCard from "./InventoryProductCard";

function ProductSection({
  title,
  description,
  products,
  loading,
  emptyMessage,
  onEdit,
  onDelete,
}: {
  title: string;
  description: string;
  products: Product[];
  loading: boolean;
  emptyMessage: string;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  return (
    <Card className="overflow-hidden rounded-2xl border-white/10 bg-[#20212b] text-white">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {description}
          </p>
        </div>

        {loading ? (
          <p className="py-8 text-center text-slate-400">
            Loading products...
          </p>
        ) : products.length === 0 ? (
          <p className="py-8 text-center text-slate-400">
            {emptyMessage}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {products.map((product) => (
              <InventoryProductCard
                key={product._id}
                product={product}
                onEdit={() => onEdit(product)}
                onDelete={() => onDelete(product)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ProductSection;