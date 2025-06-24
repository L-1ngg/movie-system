"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // 从URL中获取当前的搜索词，以便在输入框中显示
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 当用户提交表单时，我们只做一件事：
    // 使用新的搜索词跳转到新的URL
    router.push(`/?search=${searchTerm}`);
  };

  return (
    <form onSubmit={handleSearch} className="mb-8">
      <div className="flex">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="按电影名、演员或导演搜索..."
          className="w-full px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-r-md hover:bg-indigo-700"
        >
          搜索
        </button>
      </div>
    </form>
  );
}
