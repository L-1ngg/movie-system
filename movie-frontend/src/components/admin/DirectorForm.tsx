"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Director,
  DirectorFormData,
  uploadDirectorPhoto,
} from "@/services/api";
import { getToken } from "@/lib/auth";

const API_ORIGIN = "http://127.0.0.1:8000";

interface DirectorFormProps {
  initialData?: Director | null;
  onSubmit: (data: DirectorFormData) => void;
  onCancel: () => void;
  onUploadSuccess: (updatedDirector: Director) => void;
}

export default function DirectorForm({
  initialData,
  onSubmit,
  onCancel,
  onUploadSuccess,
}: DirectorFormProps) {
  const [formData, setFormData] = useState<DirectorFormData>({
    Name: "",
    Gender: "其他",
    BirthDate: null,
    Nationality: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        Name: initialData.Name,
        Gender: initialData.Gender || "其他",
        BirthDate: initialData.BirthDate || null,
        Nationality: initialData.Nationality || "",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name: fieldName, value } = e.target;
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile || !initialData) return;
    const token = getToken();
    if (!token) {
      return setError("请先登录");
    }

    setIsUploading(true);
    setError("");
    try {
       const updatedDirector = await uploadDirectorPhoto(initialData.DirectorID, photoFile, token);
      alert("照片上传成功！");
      setPhotoFile(null);
      onUploadSuccess(updatedDirector);
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

  const currentPhotoUrl = initialData?.PhotoURL
    ? `${API_ORIGIN}${initialData.PhotoURL}`
    : "/placeholder.png";

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? `编辑导演: ${initialData.Name}` : "新增导演"}
        </h2>

        {initialData && (
          <div className="mb-4 p-4 border rounded-md">
            <h3 className="font-semibold mb-2">照片</h3>
            <Image
              src={currentPhotoUrl}
              alt="照片"
              width={100}
              height={150}
              className="rounded object-cover"
            />
            <div className="mt-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 border rounded text-sm"
              >
                选择新照片...
              </button>
            </div>
            {photoFile && (
              <div className="mt-2 text-sm flex items-center gap-2">
                <span>已选择: {photoFile.name}</span>
                <button
                  onClick={handlePhotoUpload}
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
            name="Name"
            value={formData.Name}
            onChange={handleChange}
            placeholder="姓名"
            required
            className="w-full p-2 border rounded"
          />
          <select
            name="Gender"
            value={formData.Gender || "其他"}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="男">男</option>
            <option value="女">女</option>
            <option value="其他">其他</option>
          </select>
          <input
            name="BirthDate"
            value={formData.BirthDate || ""}
            onChange={handleChange}
            placeholder="出生日期 (YYYY-MM-DD)"
            type="date"
            className="w-full p-2 border rounded"
          />
          <input
            name="Nationality"
            value={formData.Nationality || ""}
            onChange={handleChange}
            placeholder="国籍"
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
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
