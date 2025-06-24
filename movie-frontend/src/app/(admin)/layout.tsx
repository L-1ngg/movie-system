"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import { getCurrentUser, UserProfile } from "@/services/api";

// 这个布局文件会保护所有 /admin/* 下的路由
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const token = getToken();
      if (!token) {
        router.replace("/login");
        return;
      }
      try {
        const user: UserProfile = await getCurrentUser(token);
        if (user.Role !== "admin") {
          // 如果不是管理员，跳转到首页
          router.replace("/");
        } else {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error(error);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };
    checkAdminStatus();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        正在验证管理员身份...
      </div>
    );
  }

  if (!isAdmin) {
    return null; // 在跳转前不渲染任何内容
  }

  return (
    <div className="flex">
      <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
        <h2 className="text-xl font-bold mb-4">管理后台</h2>
        <nav>
          <ul>
            <li>
              <Link
                href="/admin/movies"
                className="block py-2 px-4 rounded hover:bg-gray-700"
              >
                电影管理
              </Link>
            </li>
            <li>
              <Link
                href="/admin/actors"
                className="block py-2 px-4 rounded hover:bg-gray-700"
              >
                演员管理
              </Link>
            </li>
            <li>
              <Link
                href="/admin/directors"
                className="block py-2 px-4 rounded hover:bg-gray-700"
              >
                导演管理
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
