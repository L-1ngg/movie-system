"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// 定义组件的 Props 类型
interface SearchBarProps {
  initialGenres: string[];
}

export default function SearchBar({ initialGenres }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 为每个筛选器创建状态
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedGenre, setSelectedGenre] = useState(
    searchParams.get("genre") || ""
  );
  const [selectedSort, setSelectedSort] = useState(
    searchParams.get("sort_by") || "rating_desc"
  );

  // 提交表单时，根据当前所有筛选器的状态构建URL并跳转
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    // 只有当值存在时才添加到URL参数中
    if (searchTerm) params.set("search", searchTerm);
    if (selectedGenre) params.set("genre", selectedGenre);
    if (selectedSort) params.set("sort_by", selectedSort);

    router.push(`/?${params.toString()}`);
  };

  const formInputStyle =
    "px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <form
      onSubmit={handleSearch}
      className="mb-8 p-6 bg-gray-900/60 rounded-xl shadow-lg backdrop-blur-sm"
    >
      <div className="flex flex-wrap items-end gap-4">
        {/* 搜索输入框 */}
        <div className="flex-grow min-w-[200px]">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            搜索电影、演员、导演
          </label>
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="例如: 肖申克的救赎"
            className={`w-full ${formInputStyle}`}
          />
        </div>

        {/* 类型筛选 */}
        <div className="flex-grow md:flex-grow-0">
          <label
            htmlFor="genre"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            类型
          </label>
          <select
            id="genre"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className={`w-full ${formInputStyle}`}
          >
            <option value="">所有类型</option>
            {initialGenres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        {/* 排序方式 */}
        <div className="flex-grow md:flex-grow-0">
          <label
            htmlFor="sort_by"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            排序
          </label>
          <select
            id="sort_by"
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className={`w-full ${formInputStyle}`}
          >
            <option value="rating_desc">按评分降序</option>
            <option value="release_year_desc">按上映日期降序</option>
          </select>
        </div>

        {/* 提交按钮 */}
        <div className="flex-grow md:flex-grow-0">
          <button
            type="submit"
            className="w-full px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors duration-300"
          >
            搜索
          </button>
        </div>
      </div>
    </form>
  );
}
