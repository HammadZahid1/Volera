"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import {
  profileFormSchema,
  type ProfileFormValues,
} from "@/lib/validation";
import { updateProfileAction } from "@/server/actions/auth";

export function ProfileForm({
  fullName,
  phone,
}: {
  fullName: string;
  phone: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { fullName, phone },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const result = await updateProfileAction(values);

      if (!result.ok) {
        setFormError(result.message ?? "We couldn't update your profile.");
        for (const [field, messages] of Object.entries(
          result.fieldErrors ?? {},
        )) {
          if (field === "_form") continue;
          setError(field as keyof ProfileFormValues, { message: messages[0] });
        }
        return;
      }

      reset(values);
      toast.success(result.message ?? "Profile updated.");
      router.refresh();
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="profile-full-name">Full name</Label>
          <Input
            id="profile-full-name"
            autoComplete="name"
            placeholder="Your name"
            invalid={Boolean(errors.fullName)}
            {...register("fullName")}
          />
          <FieldError message={errors.fullName?.message} />
        </div>

        <div>
          <Label htmlFor="profile-phone" optional>
            Phone
          </Label>
          <Input
            id="profile-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 (415) 555-0142"
            invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
          <FieldError message={errors.phone?.message} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft pt-4">
        <p className="text-[11px] text-subtle">
          Used on orders and delivery updates.
        </p>
        <Button
          type="submit"
          size="sm"
          loading={pending}
          disabled={!isDirty || pending}
        >
          Save changes
        </Button>
      </div>
    </form>
  );
}
