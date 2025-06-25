"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getToken } from "@/lib/auth";
import { postComment, Comment } from "@/services/api";
import { FormattedDate } from "./FormattedDate";

interface CommentSectionProps {
  movieId: string;
  initialComments: Comment[];
}

export default function CommentSection({
  movieId,
  initialComments,
}: CommentSectionProps) {
  const { isLoggedIn } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const token = getToken();
    if (!token) {
      setError("请先登录再发表评论");
      return;
    }

    try {
      const addedComment = await postComment(movieId, newComment, token);
      // 成功后，将新评论添加到列表顶部，并清空输入框
      setComments([addedComment, ...comments]);
      setNewComment("");
      setError("");
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

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">评论区</h2>
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={4}
            placeholder="写下你的评论..."
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            发表评论
          </button>
        </form>
      ) : (
        <p className="mb-6 text-gray-600">
          请
          <a href="/login" className="text-indigo-600 hover:underline">
            登录
          </a>
          后发表评论。
        </p>
      )}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.CommentID} className="p-4 bg-gray-100 rounded-lg">
            <p>{comment.Content}</p>
            <p className="text-xs text-gray-500 mt-2">
              用户 {comment.user.Username}发表于{" "}
              <FormattedDate dateString={comment.CreatedAt} />
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
