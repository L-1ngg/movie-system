"use client"; // 声明这是一个客户端组件

// 全局用户认证中心
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { getToken, saveToken, removeToken } from "@/lib/auth"; // 导入操作 localStorage 中 token 的辅助函数
import { getCurrentUser, UserProfile } from "@/services/api"; // 导入获取用户信息的API调用和用户数据类型

// 定义 Context 将要提供的数据和方法的类型契约
interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (token: string) => Promise<void>; // 登录函数，接收从API获取的token
  logout: () => void;
  loading: boolean;
}

// React Context 对象
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
// AuthProvider 组件，实际的状态提供者
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 定义核心状态：用户信息和加载状态
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  // useCallback 是一个性能优化的Hook，确保这个函数在不必要时不被重新创建。
  const loadUser = useCallback(async () => {
    const token = getToken();
    if (token) {
      try {
        const userData = await getCurrentUser(token);
        setUser(userData);
      } catch (error) {
        removeToken();
        setUser(null);
        console.error("使用已存储的token获取用户失败:", error);
      }
    }
    setLoading(false);
  }, []);

  // 确保了当用户刷新页面或直接访问一个需要登录的页面时，应用会尝试根据已存在的token来恢复他的登录状态。
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (token: string) => {
    saveToken(token);
    setLoading(true);
    await loadUser();
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: !!user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
