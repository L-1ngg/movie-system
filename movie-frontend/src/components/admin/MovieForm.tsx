"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Movie,
  MovieCreateData,
  uploadMovieCover,
  getActors,
  getDirectors,
  Actor,
  Director,
} from "@/services/api";
import { getToken } from "@/lib/auth";
import Select from "react-select";

const API_ORIGIN = "http://127.0.0.1:8000";

interface MovieFormProps {
  initialData?: Movie | null;
  onSubmit: (data: MovieCreateData) => void;
  onCancel: () => void;
  onUploadSuccess: () => void;
}

interface SelectOption {
  value: number;
  label: string;
}

export default function MovieForm({
  initialData,
  onSubmit,
  onCancel,
  onUploadSuccess,
}: MovieFormProps) {
  const [formData, setFormData] = useState<MovieCreateData>({
    Title: "",
    ReleaseYear: null,
    Genre: "",
    Synopsis: "",
    Country: "",
    Language: "",
    Duration: 0,
  });
  const [allActors, setAllActors] = useState<SelectOption[]>([]);
  const [selectedActors, setSelectedActors] = useState<SelectOption[]>([]);
  const [allDirectors, setAllDirectors] = useState<SelectOption[]>([]);
  const [selectedDirectors, setSelectedDirectors] = useState<SelectOption[]>(
    []
  );

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const actorsData = await getActors();
        setAllActors(
          actorsData.map((a) => ({ value: a.ActorID, label: a.Name }))
        );

        const directorsData = await getDirectors();
        setAllDirectors(
          directorsData.map((d) => ({ value: d.DirectorID, label: d.Name }))
        );
      } catch (error) {
        console.error("获取演员或导演列表失败", error);
        setError("获取演员或导演列表失败");
      }
    };
    fetchArtists();

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
      if (initialData.actors) {
        setSelectedActors(
          initialData.actors.map((a) => ({ value: a.ActorID, label: a.Name }))
        );
      }
      if (initialData.directors) {
        setSelectedDirectors(
          initialData.directors.map((d) => ({
            value: d.DirectorID,
            label: d.Name,
          }))
        );
      }
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
    const fullSubmitData: MovieCreateData = {
      ...formData,
      actor_ids: selectedActors.map((option) => option.value),
      director_ids: selectedDirectors.map((option) => option.value),
    };
    onSubmit(fullSubmitData);
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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              演员
            </label>
            <Select
              isMulti
              options={allActors}
              value={selectedActors}
              onChange={(options) =>
                setSelectedActors(options as SelectOption[])
              }
              className="mt-1"
              classNamePrefix="select"
              placeholder="搜索并选择演员..."
              noOptionsMessage={() => "没有找到演员"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              导演
            </label>
            <Select
              isMulti
              options={allDirectors}
              value={selectedDirectors}
              onChange={(options) =>
                setSelectedDirectors(options as SelectOption[])
              }
              className="mt-1"
              classNamePrefix="select"
              placeholder="搜索并选择导演..."
              noOptionsMessage={() => "没有找到导演"}
            />
          </div>
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
