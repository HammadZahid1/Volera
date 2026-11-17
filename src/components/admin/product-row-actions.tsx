"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Archive, Loader2, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteProductAction,
  setProductActiveAction,
} from "@/server/actions/admin";
import { cn } from "@/lib/utils";

const iconButton =
  "grid size-8 place-items-center rounded-lg border border-line-soft text-subtle transition-colors hover:border-line hover:text-content disabled:opacity-40";

export function ProductRowActions({
  productId,
  productName,
  isActive,
  canDelete,
}: {
  productId: string;
  productName: string;
  isActive: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const toggleActive = () => {
    startTransition(async () => {
      const result = await setProductActiveAction(productId, !isActive);
      if (!result.ok) {
        toast.error(result.message ?? "Couldn't update the product.");
        return;
      }
      toast.success(result.message ?? "Product updated.");
      router.refresh();
    });
  };

  const remove = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    startTransition(async () => {
      const result = await deleteProductAction(productId);
      setConfirming(false);
      if (!result.ok) {
        toast.error(result.message ?? "Couldn't delete the product.");
        return;
      }
      toast.success(result.message ?? "Product deleted.");
      router.refresh();
    });
  };

  return (
    <div className="flex items-center justify-end gap-1.5">
      {pending ? (
        <span className="grid size-8 place-items-center text-subtle">
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
        </span>
      ) : null}

      <Link
        href={`/admin/products/${productId}/edit`}
        aria-label={`Edit ${productName}`}
        title="Edit"
        className={iconButton}
      >
        <Pencil className="size-3.5" aria-hidden />
      </Link>

      <button
        type="button"
        onClick={toggleActive}
        disabled={pending}
        aria-label={
          isActive
            ? `Archive ${productName}`
            : `Restore ${productName} to the catalogue`
        }
        title={isActive ? "Archive" : "Restore"}
        className={cn(
          iconButton,
          !isActive && "border-accent/30 text-accent-bright hover:border-accent/50",
        )}
      >
        {isActive ? (
          <Archive className="size-3.5" aria-hidden />
        ) : (
          <RotateCcw className="size-3.5" aria-hidden />
        )}
      </button>

      {canDelete ? (
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          aria-label={
            confirming
              ? `Confirm deleting ${productName}`
              : `Delete ${productName}`
          }
          title={confirming ? "Click again to confirm" : "Delete"}
          className={cn(
            iconButton,
            confirming
              ? "border-negative/50 bg-negative/10 text-negative"
              : "hover:border-negative/40 hover:text-negative",
          )}
        >
          <Trash2 className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
