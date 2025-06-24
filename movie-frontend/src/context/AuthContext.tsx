"use client";

import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { getToken, saveToken, removeToken } from "@/lib/auth";
import { getCurrentUser, UserProfile } from "@/services/api";

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// ↓↓↓↓ 检查并替换这个组件的实现 ↓↓↓↓
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = getToken();
    if (token) {
      try {
        const userData = await getCurrentUser(token);
        setUser(userData);
      } catch (error) {
        removeToken();
        setUser(null);
        console.error("Failed to fetch user with stored token:", error);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (token: string) => {
    saveToken(token);
    setLoading(true); // 开始加载用户信息
    await loadUser();
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  // 问题的根源在这里的 return 语句
  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: !!user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
