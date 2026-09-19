import type { Metadata, Viewport } from "next";
import { Baloo_2 } from "next/font/google";
import "./globals.css";
const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  display: "swap",
});
export const metadata: Metadata = {
  title: "Easy — little lessons, growing together",
  description:
    "An adaptive AI platform that helps parents teach their kids. A clear roadmap, thoughtful guidance, and 15-20 minutes together. Today, every lesson goes through you first.",
};
export const viewport: Viewport = { themeColor: "#FAFCF7" };
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${baloo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
