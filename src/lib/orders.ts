import { randomInt } from "node:crypto";
import { SHIPPING } from "@/lib/constants";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Human-friendly, unguessable order reference, e.g. VL-261116-8KQ4T. */
export function generateOrderNumber(date = new Date()) {
  const stamp = [
    String(date.getUTCFullYear()).slice(2),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("");
  let suffix = "";
  for (let index = 0; index < 5; index += 1) {
    suffix += ALPHABET[randomInt(0, ALPHABET.length)];
  }
  return `VL-${stamp}-${suffix}`;
}

export function shippingFor(subtotal: number, method: "standard" | "express" = "standard") {
  if (method === "express") return SHIPPING.expressRate;
  return subtotal >= SHIPPING.freeThreshold ? 0 : SHIPPING.flatRate;
}

export function deliveryWindowLabel(from = new Date()) {
  const start = new Date(from);
  start.setDate(start.getDate() + 3);
  const end = new Date(from);
  end.setDate(end.getDate() + 6);
  const format = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${format.format(start)} – ${format.format(end)}`;
}

export function orderTotal(itemsSubtotal: number, shipping: number) {
  return itemsSubtotal + shipping;
}
