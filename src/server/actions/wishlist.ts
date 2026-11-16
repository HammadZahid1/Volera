"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { newsletterSchema, toFieldErrors } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import type { ActionState, WishlistActionResult } from "@/types/commerce";

export async function toggleWishlistAction(
  productId: string,
): Promise<WishlistActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, requiresAuth: true };

  const product = await db.product.findFirst({
    where: { id: productId, isActive: true },
    select: { id: true },
  });
  if (!product) return { ok: false, message: "This product is unavailable." };

  const existing = await db.wishlistItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
    select: { id: true },
  });

  if (existing) {
    await db.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/account/wishlist");
    return { ok: true, saved: false, message: "Removed from wishlist." };
  }

  await db.wishlistItem.create({ data: { userId: user.id, productId } });
  revalidatePath("/account/wishlist");
  return { ok: true, saved: true, message: "Saved to wishlist." };
}

export async function removeWishlistAction(
  productId: string,
): Promise<WishlistActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, requiresAuth: true };

  await db.wishlistItem.deleteMany({
    where: { userId: user.id, productId },
  });
  revalidatePath("/account/wishlist");
  return { ok: true, saved: false, message: "Removed from wishlist." };
}

export async function subscribeAction(input: {
  email: string;
}): Promise<ActionState> {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Enter a valid email address.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const limit = rateLimit(`newsletter:${ip}`, {
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!limit.success) {
    return { ok: false, message: "Please try again in a few minutes." };
  }

  await db.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: {},
    create: { email: parsed.data.email },
  });

  return { ok: true, message: "You're on the list. Watch your inbox." };
}
