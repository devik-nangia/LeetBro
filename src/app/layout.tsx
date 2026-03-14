import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "LeetBro — AI-Powered LeetCode Companion",
  description:
    "Stop reading solutions. Start thinking algorithmically. LeetBro gives you progressive hints, conceptual approaches, and visual breakdowns powered by AI.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`antialiased selection:bg-[#FFA116] selection:text-black`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
