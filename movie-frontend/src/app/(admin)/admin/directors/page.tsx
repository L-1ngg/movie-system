"use client";

import { useState, useEffect } from "react";
import {
  getDirectors,
  deleteDirector,
  createDirector,
  updateDirector,
  Director,
  DirectorFormData,
} from "@/services/api";
import { getToken } from "@/lib/auth";
import DirectorForm from "@/components/admin/DirectorForm";

export default function ManageDirectorsPage() {
  const [directors, setDirectors] = useState<Director[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDirector, setEditingDirector] = useState<Director | null>(null);

  const fetchDirectors = async () => {
    setLoading(true);
    try {
      const data = await getDirectors();
      setDirectors(data);
    } catch (error) {
      console.error(error);
      alert("加载导演列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectors();
  }, []);

  const handleDelete = async (directorId: number) => {
    if (!confirm(`确定要删除ID为 ${directorId} 的导演吗？`)) return;
    const token = getToken();
    if (!token) return alert("请重新登录");
    try {
      await deleteDirector(directorId, token);
      setDirectors((prev) => prev.filter((a) => a.DirectorID !== directorId));
    } catch (err) {
      if (err instanceof Error) alert(`删除失败: ${err.message}`);
      else alert("删除失败: 发生未知错误");
    }
  };

  const handleSave = async (data: DirectorFormData) => {
    const token = getToken();
    if (!token) return alert("请重新登录");
    try {
      if (editingDirector) {
        await updateDirector(editingDirector.DirectorID, data, token);
      } else {
        await createDirector(data, token);
      }
      setIsFormOpen(false);
      setEditingDirector(null);
      fetchDirectors();
    } catch (err) {
      if (err instanceof Error) alert(`保存失败: ${err.message}`);
      else alert("保存失败: 发生未知错误");
    }
  };
  const handleUploadSuccess = (updatedDirector: Director) => {
    // 更新正在编辑的演员信息，这样弹窗里的图片就会立刻刷新
    setEditingDirector(updatedDirector);
    // 更新演员列表中的对应项
    setDirectors((prevDirectors) =>
      prevDirectors.map((a) =>
        a.DirectorID === updatedDirector.DirectorID ? updatedDirector : a
      )
    );
  };
  if (loading) return <div>加载导演列表中...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">导演管理</h1>
        <button
          onClick={() => {
            setEditingDirector(null);
            setIsFormOpen(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          新增导演
        </button>
      </div>

      {isFormOpen && (
        <DirectorForm
          initialData={editingDirector}
          onSubmit={handleSave}
          onCancel={() => setIsFormOpen(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
          <tr>
            <th className="py-3 px-6 text-left">ID</th>
            <th className="py-3 px-6 text-left">姓名</th>
            <th className="py-3 px-6 text-center">国籍</th>
            <th className="py-3 px-6 text-center">操作</th>
          </tr>
        </thead>
        <tbody className="text-gray-600 text-sm font-light">
          {directors.map((director) => (
            <tr
              key={director.DirectorID}
              className="border-b border-gray-200 hover:bg-gray-100"
            >
              <td className="py-3 px-6 text-left">{director.DirectorID}</td>
              <td className="py-3 px-6 text-left">{director.Name}</td>
              <td className="py-3 px-6 text-center">{director.Nationality}</td>
              <td className="py-3 px-6 text-center">
                <div className="flex item-center justify-center">
                  <button
                    onClick={() => {
                      setEditingDirector(director);
                      setIsFormOpen(true);
                    }}
                    className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(director.DirectorID)}
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
    </div>
  );
}
