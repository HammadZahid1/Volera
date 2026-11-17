"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  FieldError,
  FieldHint,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui/input";
import {
  adminProductFormSchema,
  type AdminProductFormValues,
} from "@/lib/validation";
import {
  createProductAction,
  updateProductAction,
} from "@/server/actions/admin";

export type AdminProductFormInitial = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  details: string;
  price: string;
  compareAtPrice: string;
  categoryId: string;
  stock: string;
  rating: string;
  reviewCount: string;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  images: string[];
};

export function AdminProductForm({
  mode,
  productId,
  initial,
  categories,
}: {
  mode: "create" | "edit";
  productId?: string;
  initial: AdminProductFormInitial;
  categories: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    getValues,
    setValue,
    control,
    formState: { errors },
  } = useForm<AdminProductFormValues>({
    resolver: zodResolver(adminProductFormSchema),
    defaultValues: {
      ...initial,
      images: initial.images.map((url) => ({ url })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "images",
  });

  const generateSlug = () => {
    const name = getValues("name");
    const slug = name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-");
    setValue("slug", slug, { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit = handleSubmit((values) => {
    setFormError(null);

    startTransition(async () => {
      const payload = {
        ...values,
        images: values.images.map((image) => image.url),
      };

      const result =
        mode === "create"
          ? await createProductAction(payload)
          : await updateProductAction(productId!, payload);

      if (!result.ok) {
        setFormError(result.message ?? "We couldn't save this product.");
        for (const [field, messages] of Object.entries(
          result.fieldErrors ?? {},
        )) {
          if (field === "_form") continue;
          setError(field as keyof AdminProductFormValues, {
            message: messages[0],
          });
        }
        return;
      }

      toast.success(result.message ?? "Product saved.");
      router.push("/admin/products");
      router.refresh();
    });
  });

  const imageError =
    errors.images?.root?.message ??
    (errors.images?.message as string | undefined);

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {formError ? (
        <div
          role="alert"
          className="rounded-xl border border-negative/25 bg-negative/[0.07] px-4 py-3 text-[13px] text-negative"
        >
          {formError}
        </div>
      ) : null}

      <section className="rounded-2xl border border-line bg-card/55 p-5">
        <h2 className="text-[14px] font-medium tracking-tight text-content">
          Basics
        </h2>
        <p className="mt-1 text-[11.5px] text-muted">
          The public identity of the piece across the storefront.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="product-name">Name</Label>
            <Input
              id="product-name"
              placeholder="Aurora Wireless Headphones"
              invalid={Boolean(errors.name)}
              {...register("name")}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div>
            <Label htmlFor="product-slug">Slug</Label>
            <div className="flex gap-2">
              <Input
                id="product-slug"
                placeholder="aurora-wireless-headphones"
                invalid={Boolean(errors.slug)}
                {...register("slug")}
              />
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={generateSlug}
                className="shrink-0 px-3"
                title="Generate a slug from the name"
              >
                <Sparkles className="size-4" aria-hidden />
                <span className="sr-only">Generate slug from name</span>
              </Button>
            </div>
            <FieldError message={errors.slug?.message} />
          </div>

          <div>
            <Label htmlFor="product-sku">SKU</Label>
            <Input
              id="product-sku"
              placeholder="VLR-AUD-001"
              invalid={Boolean(errors.sku)}
              {...register("sku")}
            />
            <FieldError message={errors.sku?.message} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="product-category">Collection</Label>
            <Select
              id="product-category"
              invalid={Boolean(errors.categoryId)}
              {...register("categoryId")}
            >
              <option value="">Choose a collection</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <FieldError message={errors.categoryId?.message} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="product-description">Description</Label>
            <Textarea
              id="product-description"
              rows={4}
              placeholder="What makes this piece worth living with?"
              invalid={Boolean(errors.description)}
              {...register("description")}
            />
            <FieldError message={errors.description?.message} />
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="product-details">Details</Label>
            <Textarea
              id="product-details"
              rows={4}
              placeholder="One detail per line — materials, dimensions, warranty…"
              invalid={Boolean(errors.details)}
              {...register("details")}
            />
            <FieldHint>
              Rendered as a list on the product page. Keep one detail per line.
            </FieldHint>
            <FieldError message={errors.details?.message} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-card/55 p-5">
        <h2 className="text-[14px] font-medium tracking-tight text-content">
          Pricing & inventory
        </h2>
        <p className="mt-1 text-[11.5px] text-muted">
          Enter prices in US dollars. They are stored as integer cents.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="product-price">Price (USD)</Label>
            <Input
              id="product-price"
              inputMode="decimal"
              placeholder="349"
              invalid={Boolean(errors.price)}
              {...register("price")}
            />
            <FieldError message={errors.price?.message} />
          </div>

          <div>
            <Label htmlFor="product-compare-price" optional>
              Compare-at price (USD)
            </Label>
            <Input
              id="product-compare-price"
              inputMode="decimal"
              placeholder="399"
              invalid={Boolean(errors.compareAtPrice)}
              {...register("compareAtPrice")}
            />
            <FieldError message={errors.compareAtPrice?.message} />
          </div>

          <div>
            <Label htmlFor="product-stock">Stock on hand</Label>
            <Input
              id="product-stock"
              inputMode="numeric"
              placeholder="24"
              invalid={Boolean(errors.stock)}
              {...register("stock")}
            />
            <FieldError message={errors.stock?.message} />
          </div>

          <div>
            <Label htmlFor="product-rating">Rating (0–5)</Label>
            <Input
              id="product-rating"
              inputMode="decimal"
              placeholder="4.8"
              invalid={Boolean(errors.rating)}
              {...register("rating")}
            />
            <FieldError message={errors.rating?.message} />
          </div>

          <div>
            <Label htmlFor="product-reviews">Review count</Label>
            <Input
              id="product-reviews"
              inputMode="numeric"
              placeholder="214"
              invalid={Boolean(errors.reviewCount)}
              {...register("reviewCount")}
            />
            <FieldError message={errors.reviewCount?.message} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-card/55 p-5">
        <h2 className="text-[14px] font-medium tracking-tight text-content">
          Visibility
        </h2>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
          {(
            [
              {
                name: "isActive",
                label: "Live in catalogue",
                hint: "Visible and purchasable",
              },
              {
                name: "isFeatured",
                label: "Featured",
                hint: "Shown on the homepage",
              },
              {
                name: "isNew",
                label: "New arrival",
                hint: "Included in new arrivals",
              },
            ] as const
          ).map((option) => (
            <label
              key={option.name}
              className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-canvas-soft/60 p-3 transition-colors hover:border-line"
            >
              <input
                type="checkbox"
                className="mt-0.5 size-4 shrink-0 accent-[#8b7cff]"
                {...register(option.name)}
              />
              <span>
                <span className="block text-[12px] font-medium text-content">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-[10.5px] text-subtle">
                  {option.hint}
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-card/55 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[14px] font-medium tracking-tight text-content">
              Images
            </h2>
            <p className="mt-1 text-[11.5px] text-muted">
              Add up to five image URLs. The first is used as the card image.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => append({ url: "" })}
            disabled={fields.length >= 5}
          >
            <Plus className="size-3.5" aria-hidden />
            Add image
          </Button>
        </div>

        <div className="mt-4 space-y-2.5">
          {fields.map((field, index) => (
            <div key={field.id}>
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <Input
                    aria-label={`Image URL ${index + 1}`}
                    placeholder="https://images.unsplash.com/photo-…"
                    invalid={Boolean(errors.images?.[index]?.url)}
                    {...register(`images.${index}.url`)}
                  />
                  <FieldError message={errors.images?.[index]?.url?.message} />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                  aria-label={`Remove image ${index + 1}`}
                  className="shrink-0"
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
              {index === 0 ? (
                <p className="mt-1 text-[10.5px] text-subtle">
                  Primary image
                </p>
              ) : null}
            </div>
          ))}
        </div>
        {imageError ? (
          <p className="mt-2 text-xs text-negative" role="alert">
            {imageError}
          </p>
        ) : null}
        <FieldError message={errors.images?.message} />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card/40 p-4">
        <p className="text-[11px] text-subtle">
          {mode === "create"
            ? "The product will appear immediately in the catalogue."
            : "Changes go live as soon as you save."}
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => router.push("/admin/products")}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="submit" size="md" loading={pending}>
            {mode === "create" ? "Create product" : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
