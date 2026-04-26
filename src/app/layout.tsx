import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "900"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VajraForce — পুরুষের আসল শক্তি | Premium Herbal Formula",
  description:
    "৯০ দিনের মধ্যে শরীরের হারানো তেজ ফিরিয়ে আনো — সম্পূর্ণ প্রাকৃতিক উপাদানে। বাংলাদেশের প্রিমিয়াম হারবাল ফর্মুলা। Lab Tested & DGDA Registered.",
  keywords: [
    "VajraForce",
    "হারবাল",
    "পুরুষের শক্তি",
    "ভেষজ সাপ্লিমেন্ট",
    "Ashwagandha",
    "Shilajit",
    "Bangladesh",
  ],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body
        className={`${playfairDisplay.variable} ${dmSans.variable} antialiased`}
        style={{ fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
