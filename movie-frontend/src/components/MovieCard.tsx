"use client";

import Link from "next/link";
import Image from "next/image";
import { Movie } from "@/services/api"; // 导入我们定义的Movie类型

const API_ORIGIN = "http://127.0.0.1:8000"; // 定义后端服务器的地址

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  // 构造完整的图片URL
  const imageUrl = movie.CoverURL
    ? `${API_ORIGIN}${movie.CoverURL}`
    : "/placeholder.png"; // 如果没有封面，使用一个占位图

  return (
    <Link
      href={`/movies/${movie.MovieID}`}
      className="block overflow-hidden bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative w-full h-96">
        <Image
          src={imageUrl}
          alt={movie.Title}
          fill
          style={{ objectFit: "cover" }}
          onError={(e) => {
            e.currentTarget.src = "/placeholder.png";
          }} // 图片加载失败时的后备处理
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold truncate">{movie.Title}</h3>
        <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
          <span>{movie.ReleaseYear}</span>
          <span className="font-bold text-yellow-500">
            ⭐ {movie.AverageRating.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  );
}
