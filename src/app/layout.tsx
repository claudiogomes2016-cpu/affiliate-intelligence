import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Affiliate Intelligence", template: "%s · Affiliate Intelligence" },
  description: "Find opportunities. Reduce CPC. Generate profit.",
  robots: { index: false, follow: false },
  // Browser auto-translation rewrites React-managed text nodes and crashes the
  // app on the next update ("client-side exception"). The UI opts out.
  other: { google: "notranslate" },
};

export const viewport: Viewport = {
  themeColor: "#0b0d10",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = (await cookies()).get("theme")?.value === "light" ? "light" : "dark";
  return (
    <html lang="en" translate="no" className="notranslate" data-theme={theme}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
