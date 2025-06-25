"use client";

import { useState, useEffect } from "react";

/**
 * 这个组件可以安全地在客户端渲染本地化时间，从而避免Next.js的注水不匹配(Hydration Mismatch)错误。
 * @param {string} dateString - 一个可以被 new Date() 解析的日期字符串。
 */
export const FormattedDate = ({ dateString }: { dateString: string }) => {
  const [isMounted, setIsMounted] = useState(false);

  // useEffect 只会在客户端运行，并且在组件挂载后执行
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 如果组件还未在客户端挂载（例如在服务端渲染或注水过程中），
  // 我们返回 null，不渲染任何东西，从而确保服务端和客户端初始HTML一致。
  if (!isMounted) {
    return null;
  }

  // 一旦组件在客户端成功挂载，我们就可以安全地渲染依赖浏览器环境的本地化时间了。
  return <>{new Date(dateString).toLocaleString()}</>;
};
