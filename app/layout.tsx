import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./providers";

export const metadata: Metadata = {
  title: "E-mart — Shop Everything",
  description: "A modern Indian e-commerce storefront with 10,000+ products."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><CartProvider>{children}</CartProvider></body>
    </html>
  );
}