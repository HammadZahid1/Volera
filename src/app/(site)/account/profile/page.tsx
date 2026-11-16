import type { Metadata } from "next";
import { CalendarDays, Mail, ShieldCheck } from "lucide-react";
import { PasswordForm } from "@/components/account/password-form";
import { ProfileForm } from "@/components/account/profile-form";
import { Badge } from "@/components/ui/badge";
import { FieldHint, Input, Label } from "@/components/ui/input";
import { requireUser } from "@/lib/auth";
import { formatDate, initials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your VELORA account details and password.",
  robots: { index: false, follow: false },
};

export default async function AccountProfilePage() {
  const user = await requireUser("/account/profile");
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="space-y-7">
      <header className="max-w-xl">
        <p className="eyebrow">Account details</p>
        <h1 className="display mt-2 text-[clamp(1.9rem,4vw,2.7rem)] leading-[1.05] text-content">
          Profile.
        </h1>
        <p className="mt-2.5 text-sm leading-relaxed text-muted">
          Keep your contact information current and protect your account with a
          strong password.
        </p>
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <section
            aria-labelledby="personal-details-heading"
            className="rounded-2xl border border-line bg-card/60 p-5"
          >
            <h2
              id="personal-details-heading"
              className="text-[14px] font-medium tracking-tight text-content"
            >
              Personal details
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">
              This is how we address your orders and correspondence.
            </p>

            <div className="mt-5">
              <Label htmlFor="profile-email">Email address</Label>
              <Input
                id="profile-email"
                type="email"
                value={user.email}
                readOnly
                disabled
                autoComplete="email"
              />
              <FieldHint>
                Email changes are disabled in this demo build.
              </FieldHint>
            </div>

            <div className="mt-5 border-t border-line-soft pt-5">
              <ProfileForm
                fullName={user.fullName}
                phone={user.phone ?? ""}
              />
            </div>
          </section>

          <section
            aria-labelledby="password-heading"
            className="rounded-2xl border border-line bg-card/60 p-5"
          >
            <h2
              id="password-heading"
              className="text-[14px] font-medium tracking-tight text-content"
            >
              Password
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">
              Choose something long and unique. Passwords are hashed before they
              touch the database.
            </p>
            <div className="mt-5">
              <PasswordForm />
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-line bg-card/40 p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-full border border-accent/30 bg-accent/10 text-[13px] font-semibold text-accent-bright">
                {initials(user.fullName)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-content">
                  {user.fullName}
                </p>
                <p className="truncate text-[11px] text-subtle">{user.email}</p>
              </div>
            </div>

            <dl className="mt-5 space-y-3 border-t border-line-soft pt-4 text-[12px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="inline-flex items-center gap-1.5 text-muted">
                  <ShieldCheck className="size-3.5 text-subtle" aria-hidden />
                  Account type
                </dt>
                <dd>
                  <Badge variant={isAdmin ? "accent" : "neutral"}>
                    {isAdmin ? "Administrator" : "Customer"}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="inline-flex items-center gap-1.5 text-muted">
                  <CalendarDays className="size-3.5 text-subtle" aria-hidden />
                  Member since
                </dt>
                <dd className="text-content">{formatDate(user.createdAt)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="inline-flex items-center gap-1.5 text-muted">
                  <Mail className="size-3.5 text-subtle" aria-hidden />
                  Orders sent to
                </dt>
                <dd className="max-w-[11rem] truncate text-content">
                  {user.email}
                </dd>
              </div>
            </dl>
          </section>

          <p className="rounded-2xl border border-line-soft bg-canvas-soft/50 p-4 text-[11px] leading-relaxed text-subtle">
            Profile and password changes are written to the local demo database.
            No email is sent in this build.
          </p>
        </aside>
      </div>
    </div>
  );
}
