import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GPT Token 管理系统",
  description: "提交和管理 ChatGPT Session Token",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
