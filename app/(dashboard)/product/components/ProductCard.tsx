import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import {
  Product,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  STATUS_LABELS,
} from "./types";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        <img
          src={
            product.image ||
            "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80"
          }
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3.5 right-4">
          <Badge
            variant={product.status === "active" ? "default" : "secondary"}
            className={
              product.status === "active"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }
          >
            {STATUS_LABELS[product.status]}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <Badge
              variant="outline"
              className={`mb-2 ${CATEGORY_COLORS[product.category]}`}
            >
              {CATEGORY_LABELS[product.category]}
            </Badge>
            <h3
              className="font-bold text-lg text-primary-900 line-clamp-1"
              title={product.name}
            >
              {product.name}
            </h3>
          </div>
        </div>

        <p className="text-sm text-muted line-clamp-2 h-10 mb-4">
          {product.description || "Tidak ada deskripsi"}
        </p>

        <div className="flex items-center justify-between">
          <p className="font-bold text-xl text-primary-700">
            Rp {product.price.toLocaleString("id-ID")}
          </p>
        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="outline"
          className="flex-1 gap-2 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 cursor-pointer"
          onClick={() => onEdit(product)}
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </Button>
        <Button
          variant="outline"
          className="w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 cursor-pointer"
          onClick={() => onDelete(product.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
