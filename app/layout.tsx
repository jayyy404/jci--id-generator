import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "46th Visayas Area Con — Delegate ID",
  description: "Look up your delegate record and generate your event ID.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
