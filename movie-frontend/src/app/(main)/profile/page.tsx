"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import {
  getCurrentUser,
  updateCurrentUser,
  UserProfile,
  UserProfileUpdateData,
} from "@/services/api";
import AvatarUploader from "@/components/AvatarUploader";

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ Username: "", Email: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const userData = await getCurrentUser(token);
        setUser(userData);
      } catch (err) {
        // 修复catch块
        console.error(err);
        if (err instanceof Error) {
          setError(err.message);
        }
        // 获取用户信息失败也可能意味着token无效，跳转到登录页
        router.push("/login");
      } finally {
        // 确保setLoading被调用
        setLoading(false);
      }
    };

    // 恢复对fetchUser的调用
    fetchUser();
  }, [router]);

  // 当user数据从后端加载后，同步表单的初始数据
  useEffect(() => {
    if (user) {
      setFormData({ Username: user.Username, Email: user.Email });
    }
  }, [user]);

  const handleUploadSuccess = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  const handleSave = async () => {
    const token = getToken();
    if (!token) return;

    const dataToUpdate: UserProfileUpdateData = {};
    if (formData.Username !== user?.Username)
      dataToUpdate.Username = formData.Username;
    if (formData.Email !== user?.Email) dataToUpdate.Email = formData.Email;

    if (Object.keys(dataToUpdate).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      const updatedUser = await updateCurrentUser(dataToUpdate, token);
      setUser(updatedUser);
      setIsEditing(false);
      setError("");
    } catch (err) {
      // 修复catch块
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("发生未知错误");
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-10">加载中...</div>;
  }

  if (!user) {
    return null; // 在重定向前不渲染任何内容
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
          个人中心
        </h1>

        <AvatarUploader
          initialAvatarUrl={user.AvatarURL}
          onUploadSuccess={handleUploadSuccess}
        />

        <div className="mt-8 border-t pt-6">
          {isEditing ? (
            <>
              <div className="py-2">
                <label className="font-semibold text-gray-600">用户名:</label>
                <input
                  type="text"
                  value={formData.Username}
                  onChange={(e) =>
                    setFormData({ ...formData, Username: e.target.value })
                  }
                  className="w-full p-1 border rounded mt-1"
                />
              </div>
              <div className="py-2">
                <label className="font-semibold text-gray-600">邮箱:</label>
                <input
                  type="email"
                  value={formData.Email}
                  onChange={(e) =>
                    setFormData({ ...formData, Email: e.target.value })
                  }
                  className="w-full p-1 border rounded mt-1"
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between py-2">
                <span className="font-semibold text-gray-600">用户名:</span>
                <span className="text-gray-800">{user.Username}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold text-gray-600">邮箱:</span>
                <span className="text-gray-800">{user.Email}</span>
              </div>
            </>
          )}
          <div className="flex justify-between py-2">
            <span className="font-semibold text-gray-600">角色:</span>
            <span className="px-2 py-1 text-sm font-semibold text-green-800 bg-green-200 rounded-full">
              {user.Role === "admin" ? "管理员" : "普通用户"}
            </span>
          </div>
        </div>
        <div className="mt-6 text-center">
          {isEditing ? (
            <div className="space-x-4">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setError("");
                }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                保存
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              编辑个人资料
            </button>
          )}
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
}
