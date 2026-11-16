import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { ProductCard } from "@/components/product/product-card";
import type { ProductCardData } from "@/lib/products";
import { cn } from "@/lib/utils";

export function ProductGrid({
  products,
  className,
  columns = 4,
  priorityCount = 0,
  animated = true,
}: {
  products: ProductCardData[];
  className?: string;
  columns?: 3 | 4;
  priorityCount?: number;
  animated?: boolean;
}) {
  const gridClassName = cn(
    "grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5",
    columns === 4
      ? "md:grid-cols-3 xl:grid-cols-4"
      : "md:grid-cols-3",
    className,
  );

  if (!animated) {
    return (
      <div className={gridClassName}>
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < priorityCount}
          />
        ))}
      </div>
    );
  }

  return (
    <StaggerGroup className={gridClassName} stagger={0.06}>
      {products.map((product, index) => (
        <StaggerItem key={product.id}>
          <ProductCard product={product} priority={index < priorityCount} />
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
