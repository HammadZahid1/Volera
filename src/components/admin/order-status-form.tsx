"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/constants";
import { updateOrderStatusAction } from "@/server/actions/admin";

export function OrderStatusForm({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      const result = await updateOrderStatusAction({
        orderId,
        status: value,
      });
      if (!result.ok) {
        toast.error(result.message ?? "Couldn't update the order.");
        return;
      }
      toast.success(result.message ?? "Order updated.");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={pending}
        aria-label="Order status"
        className="h-10 min-w-[160px] flex-1 text-[13px] sm:flex-none"
      >
        {ORDER_STATUSES.map((option) => (
          <option key={option} value={option}>
            {ORDER_STATUS_LABELS[option as OrderStatus]}
          </option>
        ))}
      </Select>
      <Button
        type="button"
        size="sm"
        onClick={save}
        loading={pending}
        disabled={value === status || pending}
      >
        Save status
      </Button>
    </div>
  );
}
