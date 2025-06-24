"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Movie, MovieFormData, uploadMovieCover } from "@/services/api";
import { getToken } from "@/lib/auth";

const API_ORIGIN = "http://127.0.0.1:8000";

interface MovieFormProps {
  initialData?: Movie | null;
  onSubmit: (data: MovieFormData) => void;
  onCancel: () => void;
  onUploadSuccess: () => void;
}

export default function MovieForm({
  initialData,
  onSubmit,
  onCancel,
  onUploadSuccess,
}: MovieFormProps) {
  const [formData, setFormData] = useState<MovieFormData>({
    Title: "",
    ReleaseYear: null,
    Genre: "",
    Synopsis: "",
    Country: "",
    Language: "",
    Duration: 0,
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        Title: initialData.Title,
        ReleaseYear: initialData.ReleaseYear,
        Genre: initialData.Genre || "",
        Synopsis: initialData.Synopsis || "",
        Country: initialData.Country || "",
        Language: initialData.Language || "",
        Duration: initialData.Duration || 0,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const val =
      name === "ReleaseYear" || name === "Duration"
        ? parseInt(value, 10) || null
        : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setCoverFile(e.target.files[0]);
    }
  };

  const handleCoverUpload = async () => {
    if (!coverFile || !initialData) return;
    const token = getToken();
    if (!token) {
      return setError("请先登录");
    }

    setIsUploading(true);
    setError("");
    try {
      await uploadMovieCover(initialData.MovieID, coverFile, token);
      alert("封面上传成功！");
      setCoverFile(null);
      onUploadSuccess();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("发生了一个未知的上传错误");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const currentCoverUrl = initialData?.CoverURL
    ? `${API_ORIGIN}${initialData.CoverURL}`
    : "/placeholder.png";

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-full overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? `编辑电影: ${initialData.Title}` : "新增电影"}
        </h2>

        {initialData && (
          <div className="mb-4 p-4 border rounded-md">
            <h3 className="font-semibold mb-2">封面图片</h3>
            <Image
              src={currentCoverUrl}
              alt="封面"
              width={100}
              height={150}
              className="rounded object-cover"
            />
            <div className="mt-2">
              <input
                type="file"
                ref={fileInputRef} // ✨ FIX 2: 确保 ref 被应用到 input 上
                onChange={handleFileChange}
                accept="image/*"
                className="hidden" // 隐藏默认样式
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()} // 点击按钮时触发隐藏的input
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                选择新封面...
              </button>
            </div>
            {coverFile && (
              <div className="mt-2 text-sm flex items-center gap-2">
                <span>已选择: {coverFile.name}</span>
                <button
                  onClick={handleCoverUpload}
                  disabled={isUploading}
                  className="ml-2 px-3 py-1 bg-green-500 text-white rounded text-xs"
                >
                  {isUploading ? "上传中..." : "上传"}
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="Title"
            value={formData.Title}
            onChange={handleChange}
            placeholder="标题"
            required
            className="w-full p-2 border rounded"
          />
          <input
            name="ReleaseYear"
            value={formData.ReleaseYear || ""}
            onChange={handleChange}
            placeholder="发行年份"
            type="number"
            className="w-full p-2 border rounded"
          />
          <input
            name="Genre"
            value={formData.Genre || ""}
            onChange={handleChange}
            placeholder="类型"
            className="w-full p-2 border rounded"
          />
          <input
            name="Country"
            value={formData.Country || ""}
            onChange={handleChange}
            placeholder="国家/地区"
            className="w-full p-2 border rounded"
          />
          <input
            name="Language"
            value={formData.Language || ""}
            onChange={handleChange}
            placeholder="语言"
            className="w-full p-2 border rounded"
          />
          <input
            name="Duration"
            value={formData.Duration || ""}
            onChange={handleChange}
            placeholder="时长(分钟)"
            type="number"
            className="w-full p-2 border rounded"
          />
          <textarea
            name="Synopsis"
            value={formData.Synopsis || ""}
            onChange={handleChange}
            placeholder="简介"
            rows={4}
            className="w-full p-2 border rounded"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              保存文本信息
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
