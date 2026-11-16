"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  createSession,
  destroySession,
  getCurrentUser,
} from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { rateLimit } from "@/lib/rate-limit";
import {
  loginSchema,
  passwordChangeSchema,
  profileSchema,
  registerSchema,
  toFieldErrors,
} from "@/lib/validation";
import type { ActionState } from "@/types/commerce";

async function requestKey(prefix: string) {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "local";
  return `${prefix}:${ip}`;
}

/** Only permit same-origin relative paths to avoid open redirects. */
function safeNext(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("://") || value.includes("\\")) return fallback;
  return value;
}

export async function loginAction(input: {
  email: string;
  password: string;
  next?: string;
}): Promise<ActionState> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const limit = rateLimit(await requestKey("login"), {
    limit: 10,
    windowMs: 5 * 60 * 1000,
  });
  if (!limit.success) {
    return {
      ok: false,
      message: `Too many attempts. Try again in ${limit.retryAfter} seconds.`,
    };
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (!user) {
    return { ok: false, message: "Email or password is incorrect." };
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { ok: false, message: "Email or password is incorrect." };
  }

  await createSession(user.id);
  const fallback = user.role === "ADMIN" ? "/admin" : "/account";

  redirect(safeNext(parsed.data.next, fallback));
}

export async function registerAction(input: {
  fullName: string;
  email: string;
  password: string;
  next?: string;
}): Promise<ActionState> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const limit = rateLimit(await requestKey("register"), {
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!limit.success) {
    return {
      ok: false,
      message: `Too many attempts. Try again in ${limit.retryAfter} seconds.`,
    };
  }

  const existing = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existing) {
    return {
      ok: false,
      fieldErrors: { email: ["An account already exists with this email."] },
    };
  }

  const user = await db.user.create({
    data: {
      email: parsed.data.email,
      fullName: parsed.data.fullName,
      passwordHash: await hashPassword(parsed.data.password),
      role: "CUSTOMER",
    },
  });

  await createSession(user.id);
  redirect(safeNext(input.next, "/account"));
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function updateProfileAction(input: {
  fullName: string;
  phone: string;
}): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in to continue." };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
    },
  });

  revalidatePath("/account");
  revalidatePath("/account/profile");
  return { ok: true, message: "Profile updated." };
}

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in to continue." };

  const parsed = passwordChangeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the highlighted fields.",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const record = await db.user.findUnique({ where: { id: user.id } });
  if (!record) return { ok: false, message: "Account not found." };

  const valid = await verifyPassword(
    parsed.data.currentPassword,
    record.passwordHash,
  );
  if (!valid) {
    return {
      ok: false,
      fieldErrors: { currentPassword: ["Current password is incorrect."] },
    };
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });

  return { ok: true, message: "Password updated successfully." };
}
