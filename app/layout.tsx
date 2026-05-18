import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

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
      <body className="min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-12">{children}</main>
      </body>
    </html>
  );
}
