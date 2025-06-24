"use client";

import { useState, useEffect } from "react";
import {
  getActors,
  deleteActor,
  createActor,
  updateActor,
  Actor,
  ActorFormData,
} from "@/services/api";
import { getToken } from "@/lib/auth";
import ActorForm from "@/components/admin/ActorForm";

export default function ManageActorsPage() {
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActor, setEditingActor] = useState<Actor | null>(null);

  const fetchActors = async () => {
    setLoading(true);
    try {
      const data = await getActors();
      setActors(data);
    } catch (error) {
      console.error(error);
      alert("加载演员列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActors();
  }, []);

  const handleDelete = async (actorId: number) => {
    if (!confirm(`确定要删除ID为 ${actorId} 的演员吗？`)) return;
    const token = getToken();
    if (!token) return alert("请重新登录");
    try {
      await deleteActor(actorId, token);
      setActors((prev) => prev.filter((a) => a.ActorID !== actorId));
    } catch (err) {
      if (err instanceof Error) alert(`删除失败: ${err.message}`);
      else alert("删除失败: 发生未知错误");
    }
  };

  const handleSave = async (data: ActorFormData) => {
    const token = getToken();
    if (!token) return alert("请重新登录");
    try {
      if (editingActor) {
        await updateActor(editingActor.ActorID, data, token);
      } else {
        await createActor(data, token);
      }
      setIsFormOpen(false);
      setEditingActor(null);
      fetchActors();
    } catch (err) {
      if (err instanceof Error) alert(`保存失败: ${err.message}`);
      else alert("保存失败: 发生未知错误");
    }
  };

  const handleUploadSuccess = (updatedActor: Actor) => {
    // 更新正在编辑的演员信息，这样弹窗里的图片就会立刻刷新
    setEditingActor(updatedActor);
    // 更新演员列表中的对应项
    setActors((prevActors) =>
      prevActors.map((a) =>
        a.ActorID === updatedActor.ActorID ? updatedActor : a
      )
    );
  };

  if (loading) return <div>加载演员列表中...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">演员管理</h1>
        <button
          onClick={() => {
            setEditingActor(null);
            setIsFormOpen(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          新增演员
        </button>
      </div>

      {isFormOpen && (
        <ActorForm
          initialData={editingActor}
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
          {actors.map((actor) => (
            <tr
              key={actor.ActorID}
              className="border-b border-gray-200 hover:bg-gray-100"
            >
              <td className="py-3 px-6 text-left">{actor.ActorID}</td>
              <td className="py-3 px-6 text-left">{actor.Name}</td>
              <td className="py-3 px-6 text-center">{actor.Nationality}</td>
              <td className="py-3 px-6 text-center">
                <div className="flex item-center justify-center">
                  <button
                    onClick={() => {
                      setEditingActor(actor);
                      setIsFormOpen(true);
                    }}
                    className="w-4 mr-2 transform hover:text-purple-500 hover:scale-110"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(actor.ActorID)}
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
