"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import {
  getCurrentUser,
  updateCurrentUser,
  updateUserPassword,
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
  // 为密码修改功能新增独立的状态
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

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

  //密码保存
  const handlePasswordSave = async (e: FormEvent) => {
    e.preventDefault(); // 阻止表单默认提交行为
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("新密码两次输入不一致");
      return;
    }
    if (!currentPassword || !newPassword) {
      setPasswordError("所有密码字段均为必填项");
      return;
    }

    const token = getToken();
    if (!token) {
      setPasswordError("认证失败，请重新登录");
      return;
    }

    try {
      await updateUserPassword(
        {
          current_password: currentPassword,
          new_password: newPassword,
        }
        // token
      );

      setPasswordSuccess("密码修改成功！");
      // 清空密码输入框
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof Error) {
        setPasswordError(err.message);
      } else {
        setPasswordError("发生了一个未知的错误");
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
      {/* 修改密码表单 */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-center mb-4">修改密码</h2>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <div>
            <label className="font-semibold text-gray-600">当前密码:</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-1 border rounded mt-1"
              required
            />
          </div>
          <div>
            <label className="font-semibold text-gray-600">新密码:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-1 border rounded mt-1"
              required
            />
          </div>
          <div>
            <label className="font-semibold text-gray-600">确认新密码:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-1 border rounded mt-1"
              required
            />
          </div>
          {passwordError && (
            <p className="text-red-500 text-sm text-center">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="text-green-600 text-sm text-center">
              {passwordSuccess}
            </p>
          )}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              确认修改密码
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
