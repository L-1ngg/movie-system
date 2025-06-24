"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getToken } from "@/lib/auth";
import { postRating } from "@/services/api";
import Rating from "./Rating"; // 导入我们刚创建的UI组件

interface RatingSectionProps {
  movieId: string;
}

export default function RatingSection({ movieId }: RatingSectionProps) {
  const { isLoggedIn } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRatingSubmit = async (score: number) => {
    setMessage("");
    setError("");

    const token = getToken();
    if (!token) {
      setError("请先登录再进行评分。");
      return;
    }

    try {
      await postRating(movieId, score, token);
      setMessage(`感谢您的评分，您评了 ${score} 分！`);
    } catch (err) {
      // err 的类型是 unknown
      // 先判断 err 是否是一个真正的 Error 对象
      if (err instanceof Error) {
        setError(err.message);
      } else {
        // 如果捕获到的不是Error对象，给一个通用错误信息
        setError("发生了一个未知错误");
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <p className="mt-4 text-gray-600">
        请
        <a href="/login" className="text-indigo-600 hover:underline">
          登录
        </a>
        后进行评分。
      </p>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">为这部电影打分：</h3>
      <Rating onRatingSubmit={handleRatingSubmit} />
      {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}
