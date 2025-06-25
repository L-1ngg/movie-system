"use client"; // 声明这是一个客户端组件

import Image from "next/image";
import CommentSection from "@/components/CommentSection";
import RatingSection from "@/components/RatingSection";
import { Movie, Comment, Actor, Director } from "@/services/api";

const API_ORIGIN = "http://127.0.0.1:8000"; // 定义后端服务器的地址

// 定义这个组件接收的props类型
interface MovieDetailsViewProps {
  movie: Movie;
  comments: Comment[];
}

// 这是一个可复用的组件，用于渲染导演或演员列表
const ArtistList = ({
  title,
  artists,
}: {
  title: string;
  artists: (Actor | Director)[];
}) => (
  <div className="mb-8">
    <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
      {title}
    </h3>
    <ul className="space-y-4">
      {artists.map((artist) => {
        // 根据类型（Actor或Director）获取ID
        const artistId =
          "ActorID" in artist ? artist.ActorID : artist.DirectorID;
        const artistPhotoUrl = artist.PhotoURL
          ? `${API_ORIGIN}${artist.PhotoURL}`
          : "/placeholder.png";

        return (
          <li key={artistId} className="flex items-center gap-4">
            <div className="w-[50px] h-[75px] flex-shrink-0">
              <Image
                src={artistPhotoUrl}
                alt={artist.Name}
                width={50}
                height={75}
                className="rounded object-cover w-full h-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.png";
                }}
              />
            </div>
            <span>{artist.Name}</span>
          </li>
        );
      })}
    </ul>
  </div>
);

export default function MovieDetailsView({
  movie,
  comments,
}: MovieDetailsViewProps) {
  const imageUrl = movie.CoverURL
    ? `${API_ORIGIN}${movie.CoverURL}`
    : "/placeholder.png";

  return (
    // 1. 使用flex布局来划分主内容区和侧边栏
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10 lg:gap-16">
      {/* 主内容区 */}
      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Image
              src={imageUrl}
              alt={movie.Title}
              width={300}
              height={450}
              className="rounded-lg shadow-lg w-full"
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
            <p className="mt-6 text-gray-700 leading-relaxed">
              {movie.Synopsis}
            </p>
            <RatingSection movieId={String(movie.MovieID)} />
          </div>
        </div>

        <CommentSection
          movieId={String(movie.MovieID)}
          initialComments={comments}
        />
      </div>

      {/* 侧边栏区域 */}
      <aside className="w-full lg:w-64 flex-shrink-0">
        {movie.directors && movie.directors.length > 0 && (
          <ArtistList title="导演" artists={movie.directors} />
        )}
        {movie.actors && movie.actors.length > 0 && (
          <ArtistList title="主要演员" artists={movie.actors} />
        )}
      </aside>
    </div>
  );
}
