import type { Product } from "@/lib/types";
import { Hash, Palette, ShoppingBag, Code } from "lucide-react";

interface ProductItemProps {
  product: Product;
}

export default function ProductItem({ product }: ProductItemProps) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 rounded-md bg-primary/10 p-2 mt-1">
            <ShoppingBag className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-grow">
          <h4 className="font-semibold text-base text-foreground mb-2">{product.name}</h4>
          
          <div className="flex items-center gap-2 text-sm">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground shrink-0 font-medium">Variação:</span>
            <span className="font-semibold text-foreground text-sm">{product.variation}</span>
          </div>

          {product.sku && (
            <div className="flex items-center gap-2 text-sm mt-1">
              <Code className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground shrink-0 font-medium">SKU:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400 text-sm">{product.sku}</span>
            </div>
          )}
          
           <div className="flex items-center gap-2 text-sm mt-1">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">Qtd:</span>
            <span className="font-medium text-foreground">{product.quantity}</span>
          </div>

           {product.parentSku && (
            <div className="flex items-center gap-2 text-sm mt-1">
              <Code className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground shrink-0 font-medium">Parent SKU:</span>
              <span className="font-medium text-foreground text-sm">{product.parentSku}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

    