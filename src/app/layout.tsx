import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpiderNet Control Deck",
  description:
    "Internal operations console for SpiderNet system visibility, tool routing, and disciplined multi-agent execution.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-100 antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
