import type { Metadata, Viewport } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { SITE } from "@/lib/constants";
import { absoluteUrl } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: `${SITE.name} — Premium essentials for modern living`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "premium essentials",
    "modern lifestyle",
    "design objects",
    "audio",
    "timepieces",
    "leather goods",
    "VELORA",
  ],
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    title: `${SITE.name} — Premium essentials for modern living`,
    description: SITE.description,
    siteName: SITE.name,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — Premium essentials for modern living`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#08090c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-canvas text-content">
        <div aria-hidden className="noise-overlay" />
        <div className="relative z-[2] flex min-h-dvh flex-col">{children}</div>
        <Toaster
          theme="dark"
          position="bottom-right"
          closeButton
          offset={20}
          toastOptions={{
            classNames: {
              toast:
                "!bg-card !border !border-line !text-content !rounded-xl !shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]",
              description: "!text-muted",
              actionButton: "!bg-accent !text-[#0a0a10]",
              cancelButton: "!bg-raised !text-content",
            },
          }}
        />
      </body>
    </html>
  );
}
