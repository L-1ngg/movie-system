"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  // 从 useAuth() 中获取完整的 user 对象和 loading 状态
  const { user, isLoggedIn, logout, loading } = useAuth();

  // 在加载用户信息时，显示一个占位或什么都不显示
  if (loading) {
    return (
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-3 h-[60px]">
          {/* Loading Skeleton or empty */}
        </nav>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            电影评分系统
          </Link>
          <div className="flex items-center space-x-4">
            {isLoggedIn && user ? (
              <>
                {/* 检查用户角色，如果是admin则显示后台管理链接 */}
                {user.Role === "admin" && (
                  <Link
                    href="/admin/movies"
                    className="px-3 py-2 text-white bg-green-600 rounded hover:bg-green-700"
                  >
                    后台管理
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="px-3 py-2 text-gray-700 rounded hover:bg-gray-200"
                >
                  {user.Username} (个人中心)
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-2 text-gray-700 bg-red-200 rounded hover:bg-red-300"
                >
                  注销
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-2 text-gray-700 rounded hover:bg-gray-200"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
