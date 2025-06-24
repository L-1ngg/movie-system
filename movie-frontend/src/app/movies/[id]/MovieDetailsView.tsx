"use client"; // 声明这是一个客户端组件

import Image from "next/image";
import CommentSection from "@/components/CommentSection";
import RatingSection from "@/components/RatingSection"; // 导入评分组件
import { Movie, Comment } from "@/services/api";

const API_ORIGIN = "http://127.0.0.1:8000"; // 定义后端服务器的地址

// 定义这个组件接收的props类型
interface MovieDetailsViewProps {
  movie: Movie;
  comments: Comment[];
}

// 将之前page.tsx中的所有JSX代码都移动到这里
export default function MovieDetailsView({
  movie,
  comments,
}: MovieDetailsViewProps) {
  const imageUrl = movie.CoverURL
    ? `${API_ORIGIN}${movie.CoverURL}`
    : "/placeholder.png";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Image
            src={imageUrl}
            alt={movie.Title}
            width={300}
            height={450}
            className="rounded-lg shadow-lg w-full"
            // 在客户端组件中，onError可以正常使用
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.png";
            }}
          />
        </div>
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold">{movie.Title}</h1>
          <p className="text-lg text-gray-500 mt-1">{movie.ReleaseYear}</p>
          <div className="mt-4 flex items-center space-x-4">
            <span className="font-bold text-2xl text-yellow-500">
              ⭐ {movie.AverageRating.toFixed(1)}
            </span>
            <span className="text-gray-600">({movie.RatingCount}人评分)</span>
          </div>
          <div className="mt-4 space-x-2">
            <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-sm">
              {movie.Genre}
            </span>
            <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-sm">
              {movie.Country}
            </span>
            <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-sm">
              {movie.Language}
            </span>
          </div>
          <p className="mt-6 text-gray-700 leading-relaxed">{movie.Synopsis}</p>
          <RatingSection movieId={String(movie.MovieID)} />
        </div>
      </div>

      {/* 评论区，我们将获取到的初始评论数据和电影ID传递给它 */}
      <CommentSection
        movieId={String(movie.MovieID)}
        initialComments={comments}
      />
    </div>
  );
}
