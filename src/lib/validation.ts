import { z } from "zod";

const trimmed = (value: unknown) =>
  typeof value === "string" ? value.trim() : value;

export const emailField = z.preprocess(
  (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  z.email("Enter a valid email address"),
);

export const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be 72 characters or fewer")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Enter your password").max(72),
  next: z.string().optional(),
});

export const registerSchema = z.object({
  fullName: z
    .preprocess(trimmed, z.string().min(2, "Enter your full name").max(80)),
  email: emailField,
  password: passwordField,
});

export const profileSchema = z.object({
  fullName: z
    .preprocess(trimmed, z.string().min(2, "Enter your full name").max(80)),
  phone: z.preprocess(
    (value) => (value === "" ? null : trimmed(value)),
    z
      .string()
      .max(24, "Enter a valid phone number")
      .regex(/^[+()\d\s-]+$/, "Enter a valid phone number")
      .nullable(),
  ),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;

export const checkoutSchema = z.object({
  fullName: z
    .preprocess(trimmed, z.string().min(2, "Enter the recipient's full name").max(90)),
  email: emailField,
  phone: z.preprocess(
    trimmed,
    z
      .string()
      .min(7, "Enter a phone number we can reach you on")
      .max(24)
      .regex(/^[+()\d\s-]+$/, "Enter a valid phone number"),
  ),
  address: z.preprocess(
    trimmed,
    z.string().min(5, "Enter your street address").max(160),
  ),
  city: z.preprocess(trimmed, z.string().min(2, "Enter your city").max(80)),
  postalCode: z.preprocess(
    trimmed,
    z.string().min(2, "Enter your postal code").max(16),
  ),
  deliveryInstructions: z.preprocess(
    (value) => (value === "" ? null : trimmed(value)),
    z.string().max(500, "Keep instructions under 500 characters").nullable(),
  ),
  idempotencyKey: z.string().min(8).max(64),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "Your bag is empty"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** The address/contact portion of checkout, reused by the client form. */
export const checkoutFormSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the recipient's full name").max(90),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a phone number we can reach you on")
    .max(24)
    .regex(/^[+()\d\s-]+$/, "Enter a valid phone number"),
  address: z.string().trim().min(5, "Enter your street address").max(160),
  city: z.string().trim().min(2, "Enter your city").max(80),
  postalCode: z.string().trim().min(2, "Enter your postal code").max(16),
  deliveryInstructions: z
    .string()
    .trim()
    .max(500, "Keep instructions under 500 characters"),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

/** Client-side profile form; the server schema converts blank phone to null. */
export const profileFormSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .max(24, "Enter a valid phone number")
    .regex(/^[+()\d\s-]*$/, "Enter a valid phone number"),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const newsletterSchema = z.object({
  email: emailField,
});

export const orderStatusField = z.enum([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const productImageSchema = z.preprocess(
  trimmed,
  z.url("Enter a valid image URL").max(600),
);

export const adminProductSchema = z.object({
  name: z.preprocess(trimmed, z.string().min(2, "Enter a product name").max(120)),
  slug: z.preprocess(
    trimmed,
    z
      .string()
      .min(2, "Enter a slug")
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
  ),
  sku: z.preprocess(
    trimmed,
    z.string().min(2, "Enter a SKU").max(40).regex(/^[A-Z0-9-]+$/, "Use uppercase letters, numbers and hyphens"),
  ),
  description: z.preprocess(
    trimmed,
    z.string().min(20, "Write at least 20 characters").max(2000),
  ),
  details: z.preprocess(
    trimmed,
    z.string().min(10, "Add at least one detail line").max(1200),
  ),
  price: z.coerce.number().min(1, "Price must be greater than zero").max(100000),
  compareAtPrice: z
    .union([z.literal(""), z.coerce.number().min(0).max(100000)])
    .optional(),
  categoryId: z.string().min(1, "Choose a category"),
  stock: z.coerce.number().int().min(0).max(100000),
  rating: z.coerce.number().min(0).max(5),
  reviewCount: z.coerce.number().int().min(0).max(1000000),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isActive: z.boolean().default(true),
  images: z.array(productImageSchema).min(1, "Add at least one image").max(5),
});

export type AdminProductInput = z.infer<typeof adminProductSchema>;

export const adminCategorySchema = z.object({
  name: z.preprocess(trimmed, z.string().min(2, "Enter a name").max(60)),
  slug: z.preprocess(
    trimmed,
    z
      .string()
      .min(2)
      .max(60)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
  ),
  description: z.preprocess(trimmed, z.string().min(10).max(300)),
  imageUrl: productImageSchema,
});

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(80),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    password: passwordField,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const searchQuerySchema = z
  .string()
  .trim()
  .max(80)
  .catch("");

/** Normalize a ZodError into a serializable field-error map for forms. */
export function toFieldErrors(error: z.ZodError) {
  const flat = z.flattenError(error);
  const result: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(flat.fieldErrors)) {
    if (Array.isArray(value) && value.length > 0) {
      result[key] = value.filter((message): message is string => Boolean(message));
    }
  }

  if (flat.formErrors.length > 0) {
    result._form = flat.formErrors;
  }

  return result;
}
