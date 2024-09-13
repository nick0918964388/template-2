import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "語音筆記應用",
  description: "使用語音創建和管理您的筆記",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="bg-gray-100">{children}</body>
    </html>
  );
}
