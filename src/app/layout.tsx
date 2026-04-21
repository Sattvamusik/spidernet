import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Setu Mother Bridge",
  description:
    "Parent shell for architecture, naming, module wiring, ownership boundaries, and child-module routing.",
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
