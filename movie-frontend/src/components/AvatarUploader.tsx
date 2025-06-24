"use client";

import { useState, useRef, useEffect } from "react"; // 导入 useEffect
import Image from "next/image";
import { getToken } from "@/lib/auth";
import { uploadAvatar, UserProfile } from "@/services/api";

const API_ORIGIN = "http://127.0.0.1:8000";

interface AvatarUploaderProps {
  initialAvatarUrl: string | null;
  onUploadSuccess: (updatedUser: UserProfile) => void;
}

export default function AvatarUploader({
  initialAvatarUrl,
  onUploadSuccess,
}: AvatarUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  // 关键修复：preview的初始状态必须是null，它只用于本地预览
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 新增：当从父组件传来的initialAvatarUrl变化时，清除本地预览
  useEffect(() => {
    setPreview(null);
  }, [initialAvatarUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    const token = getToken();
    if (!token) {
      setError("认证失败，请重新登录。");
      return;
    }

    setIsUploading(true);
    setError("");
    try {
      const updatedUser = await uploadAvatar(file, token);
      onUploadSuccess(updatedUser);
      setFile(null);
    } catch (err) {
      // err 的类型是 unknown
      // 先判断 err 是否是一个真正的 Error 对象
      if (err instanceof Error) {
        setError(err.message);
      } else {
        // 如果捕获到的不是Error对象，给一个通用错误信息
        setError("发生了一个未知错误");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const currentAvatar = preview
    ? preview
    : initialAvatarUrl
    ? `${API_ORIGIN}${initialAvatarUrl}`
    : "/placeholder.png";

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        className="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Image
          src={currentAvatar}
          alt="User Avatar"
          fill
          style={{ objectFit: "cover" }}
          key={preview || initialAvatarUrl} // 使用key来强制Image组件在URL变化时重新渲染
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.png";
          }}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/gif"
          className="hidden"
        />
      </div>
      <p className="text-sm text-gray-500 font-bold">点击头像更换图片</p>
      {file && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
        >
          {isUploading ? "上传中..." : "保存新头像"}
        </button>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
