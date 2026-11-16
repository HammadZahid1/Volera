import Link from "next/link";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { NewsletterForm } from "@/components/newsletter-form";
import { FOOTER_LINKS, SITE } from "@/lib/constants";

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="grid size-9 place-items-center rounded-full border border-line text-subtle transition-colors hover:border-white/20 hover:text-content"
    >
      {children}
    </a>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line-soft bg-surface/50">
      <div className="container-page py-14 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-sm leading-relaxed text-muted">
              {SITE.description}
            </p>

            <div className="mt-6 space-y-2 text-[12px] text-subtle">
              <p className="flex items-center gap-2">
                <MapPin className="size-3.5" />
                {SITE.location}
              </p>
              <a
                href={`mailto:${SITE.supportEmail}`}
                className="flex items-center gap-2 transition-colors hover:text-content"
              >
                <Mail className="size-3.5" />
                {SITE.supportEmail}
              </a>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <SocialLink href={SITE.social.instagram} label="Instagram">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  className="size-4"
                  aria-hidden
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
                </svg>
              </SocialLink>
              <SocialLink href={SITE.social.x} label="X">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-3.5"
                  aria-hidden
                >
                  <path d="M17.9 3H21l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.2 21H2l7.3-8.3L2.3 3h6.4l4.4 5.8L17.9 3Zm-1.1 16h1.7L7.4 4.7H5.6L16.8 19Z" />
                </svg>
              </SocialLink>
              <SocialLink href={SITE.social.pinterest} label="Pinterest">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-4"
                  aria-hidden
                >
                  <path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.6 2.2-.9 3.4-.2 1 .5 1.9 1.5 1.9 1.8 0 3.2-1.9 3.2-4.7 0-2.4-1.7-4.1-4.2-4.1-2.9 0-4.6 2.2-4.6 4.4 0 .9.3 1.8.8 2.3.1.1.1.2.1.3l-.3 1.2c0 .2-.2.3-.4.2-1.4-.6-2.3-2.7-2.3-4.4 0-3.6 2.6-6.9 7.5-6.9 3.9 0 7 2.8 7 6.6 0 3.9-2.5 7.1-5.9 7.1-1.2 0-2.3-.6-2.6-1.3l-.7 2.7c-.3 1-1 2.3-1.5 3.1A10 10 0 1 0 12 2Z" />
                </svg>
              </SocialLink>
            </div>
          </div>

          <div>
            <p className="eyebrow mb-4">Shop</p>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-muted transition-colors hover:text-content"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4">Support</p>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-muted transition-colors hover:text-content"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-4">Company</p>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-muted transition-colors hover:text-content"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 grid gap-6 border-t border-line-soft pt-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-subtle">
              The VELORA letter
            </p>
            <p className="mt-1 text-sm text-muted">
              New arrivals, studio notes and considered recommendations.
            </p>
          </div>
          <NewsletterForm />
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-line-soft pt-6 text-[11px] text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="transition-colors hover:text-content">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-content">
              Terms
            </Link>
            <span className="hidden text-line sm:inline">·</span>
            <span>Demo storefront — no real payments are processed</span>
            <Link
              href="/about"
              className="inline-flex items-center gap-1 text-muted transition-colors hover:text-content"
            >
              About VELORA
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
