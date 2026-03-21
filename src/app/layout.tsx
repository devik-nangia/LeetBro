import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

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
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased selection:bg-[#FFA116] selection:text-black overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
