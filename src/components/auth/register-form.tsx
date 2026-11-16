"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { registerAction } from "@/server/actions/auth";
import { registerFormSchema, type RegisterFormValues } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { FieldError, FieldHint, Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function RegisterForm({ next }: { next?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");
  const checks = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "A letter", met: /[A-Za-z]/.test(password) },
    { label: "A number", met: /\d/.test(password) },
  ];

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await registerAction({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        next,
      });
      if (result && !result.ok) {
        setFormError(result.message ?? "We couldn't create your account.");
        for (const [field, messages] of Object.entries(result.fieldErrors ?? {})) {
          if (field === "_form") continue;
          setError(field as keyof RegisterFormValues, { message: messages[0] });
        }
        return;
      }
      toast.success("Your VELORA account is ready.");
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
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          autoComplete="name"
          placeholder="Amelia Hart"
          invalid={Boolean(errors.fullName)}
          {...register("fullName")}
        />
        <FieldError message={errors.fullName?.message} />
      </div>

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
            autoComplete="new-password"
            placeholder="Create a password"
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
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
          {checks.map((check) => (
            <span
              key={check.label}
              className={cn(
                "inline-flex items-center gap-1.5 text-[11px] transition-colors",
                check.met ? "text-positive" : "text-subtle",
              )}
            >
              <Check
                className={cn(
                  "size-3",
                  check.met ? "opacity-100" : "opacity-40",
                )}
              />
              {check.label}
            </span>
          ))}
        </div>
        <FieldError message={errors.password?.message} />
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repeat your password"
          invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
        <FieldError message={errors.confirmPassword?.message} />
      </div>

      <Button type="submit" size="lg" className="w-full" loading={pending}>
        {pending ? "Creating account" : "Create account"}
        {!pending ? <ArrowRight className="size-4" /> : null}
      </Button>

      <FieldHint>
        By creating an account you agree to our{" "}
        <Link href="/terms" className="text-muted underline underline-offset-2 hover:text-content">
          terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-muted underline underline-offset-2 hover:text-content">
          privacy policy
        </Link>
        .
      </FieldHint>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="font-medium text-content underline-offset-4 transition-colors hover:text-accent hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
