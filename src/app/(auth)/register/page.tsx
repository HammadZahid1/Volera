import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a VELORA account to shop considered essentials.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/account");

  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;

  return (
    <div>
      <p className="eyebrow mb-4">Join VELORA</p>
      <h1 className="text-[2rem] font-medium leading-tight tracking-[-0.03em] text-content">
        Create your account
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        One account for orders, saved pieces and a faster checkout.
      </p>

      <div className="mt-8">
        <RegisterForm next={next} />
      </div>
    </div>
  );
}
