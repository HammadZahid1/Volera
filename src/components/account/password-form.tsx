"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldError, FieldHint, Input, Label } from "@/components/ui/input";
import {
  passwordChangeSchema,
  type PasswordChangeValues,
} from "@/lib/validation";
import { changePasswordAction } from "@/server/actions/auth";

export function PasswordForm() {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await changePasswordAction(values);

      if (!result.ok) {
        setFormError(result.message ?? "We couldn't update your password.");
        for (const [field, messages] of Object.entries(
          result.fieldErrors ?? {},
        )) {
          if (field === "_form") continue;
          setError(field as keyof PasswordChangeValues, {
            message: messages[0],
          });
        }
        return;
      }

      reset();
      toast.success(result.message ?? "Password updated.");
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {formError ? (
        <div
          role="alert"
          className="rounded-xl border border-negative/25 bg-negative/[0.07] px-4 py-3 text-[13px] text-negative"
        >
          {formError}
        </div>
      ) : null}

      <div>
        <Label htmlFor="current-password">Current password</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your current password"
          invalid={Boolean(errors.currentPassword)}
          {...register("currentPassword")}
        />
        <FieldError message={errors.currentPassword?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            placeholder="Choose a new password"
            invalid={Boolean(errors.newPassword)}
            {...register("newPassword")}
          />
          <FieldError message={errors.newPassword?.message} />
        </div>

        <div>
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat the new password"
            invalid={Boolean(errors.confirmPassword)}
            {...register("confirmPassword")}
          />
          <FieldError message={errors.confirmPassword?.message} />
        </div>
      </div>

      <FieldHint>
        At least 8 characters, including one letter and one number.
      </FieldHint>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft pt-4">
        <p className="inline-flex items-center gap-1.5 text-[11px] text-subtle">
          <KeyRound className="size-3.5" aria-hidden />
          You will stay signed in on this device.
        </p>
        <Button type="submit" size="sm" loading={pending}>
          Update password
        </Button>
      </div>
    </form>
  );
}
