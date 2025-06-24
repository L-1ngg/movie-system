"use client";

import { useState, useEffect } from "react";
import {
  getMovies,
  deleteMovie,
  createMovie,
  updateMovie,
  Movie,
  MovieFormData,
} from "@/services/api";
import { getToken } from "@/lib/auth";
import MovieForm from "@/components/admin/MovieForm";

export default function ManageMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const data = await getMovies();
      setMovies(data);
    } catch (error) {
      console.error(error);
      alert("加载电影列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleDelete = async (movieId: number) => {
    if (!confirm(`确定要删除ID为 ${movieId} 的电影吗？`)) return;

    const token = getToken();
    if (!token) {
      return alert("请重新登录");
    }

    try {
      await deleteMovie(movieId, token);
      setMovies((prevMovies) =>
        prevMovies.filter((m) => m.MovieID !== movieId)
      );
    } catch (err) {
      if (err instanceof Error) {
        alert(`删除失败: ${err.message}`);
      } else {
        alert("删除失败: 发生未知错误");
      }
    }
  };

  const handleSave = async (data: MovieFormData) => {
    const token = getToken();
    if (!token) {
      return alert("请重新登录");
    }

    try {
      if (editingMovie) {
        await updateMovie(editingMovie.MovieID, data, token);
      } else {
        await createMovie(data, token);
      }
      setIsFormOpen(false);
      setEditingMovie(null);
      fetchMovies();
    } catch (err) {
      if (err instanceof Error) {
        alert(`保存失败: ${err.message}`);
      } else {
        alert("保存失败: 发生未知错误");
      }
    }
  };

  const openFormForEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setIsFormOpen(true);
  };

  const openFormForCreate = () => {
    setEditingMovie(null);
    setIsFormOpen(true);
  };

  if (loading) return <div>加载电影列表中...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">电影管理</h1>
        <button
          onClick={openFormForCreate}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          新增电影
        </button>
      </div>

      {isFormOpen && (
        <MovieForm
          initialData={editingMovie}
          onSubmit={handleSave}
          onCancel={() => setIsFormOpen(false)}
          onUploadSuccess={fetchMovies}
        />
      )}

      {/* ▼▼▼ 补全这里的表格渲染逻辑 ▼▼▼ */}
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left">ID</th>
            <th className="py-3 px-6 text-left">标题</th>
            <th className="py-3 px-6 text-center">年份</th>
            <th className="py-3 px-6 text-center">操作</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {movies.map((movie) => (
            <tr
              key={movie.MovieID}
              className="border-b border-gray-200 hover:bg-gray-100"
            >
              <td className="py-3 px-6 text-left whitespace-nowrap">
                {movie.MovieID}
              </td>
              <td className="py-3 px-6 text-left">{movie.Title}</td>
              <td className="py-3 px-6 text-center">{movie.ReleaseYear}</td>
              <td className="py-3 px-6 text-center">
                <div className="flex item-center justify-center">
                  <button
                    onClick={() => openFormForEdit(movie)}
                    className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(movie.MovieID)}
                    className="w-4 mr-2 transform hover:text-red-500 hover:scale-110"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* ▲▲▲ 补全结束 ▲▲▲ */}
    </div>
  );
}
