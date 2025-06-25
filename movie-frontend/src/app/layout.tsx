import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { AuthProvider } from "@/context/AuthContext";

//字体信息的对象
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "电影评分系统",
  description: "一个基于Next.js和FastAPI的电影评分系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        {/* 用 AuthProvider 将所有页面内容（包括Header）包裹起来 */}
        <AuthProvider>
          <Header />
          <main className="container mx-auto px-6 py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
