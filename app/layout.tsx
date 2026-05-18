import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Singapore Government Skills Lab",
  description: "Discover and download AI skills for your team",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
