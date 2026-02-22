import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "今晚食唔食",
  description: "香港家庭晚餐回覆工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-HK">
      <body>{children}</body>
    </html>
  );
}
