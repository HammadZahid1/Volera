"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { loginAction } from "@/server/actions/auth";
import { loginFormSchema, type LoginFormValues } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await loginAction({ ...values, next });
      if (result && !result.ok) {
        setFormError(result.message ?? "We couldn't sign you in.");
        for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
          if (field === "_form") continue;
          setError(field as keyof LoginFormValues, {
            message: messages[0],
          });
        }
        return;
      }
      toast.success("Welcome back to VELORA.");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {formError ? (
        <div
          role="alert"
          className="rounded-xl border border-negative/25 bg-negative/[0.07] px-4 py-3 text-sm text-negative"
        >
          {formError}
        </div>
      ) : null}

      <div>
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          invalid={Boolean(errors.email)}
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            className="pr-11"
            invalid={Boolean(errors.password)}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-subtle transition-colors hover:bg-white/5 hover:text-content"
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        <FieldError message={errors.password?.message} />
      </div>

      <Button type="submit" size="lg" className="w-full" loading={pending}>
        {pending ? "Signing in" : "Sign in"}
        {!pending ? <ArrowRight className="size-4" /> : null}
      </Button>

      <p className="text-center text-sm text-muted">
        New to VELORA?{" "}
        <Link
          href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
          className="font-medium text-content underline-offset-4 transition-colors hover:text-accent hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
