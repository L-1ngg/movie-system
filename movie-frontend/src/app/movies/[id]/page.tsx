// movie-frontend/src/app/movies/[id]/page.tsx

import { getMovieById, getCommentsByMovieId } from "@/services/api";
import MovieDetailsView from "./MovieDetailsView";

interface MovieDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function MovieDetailsPage({
  params,
}: MovieDetailsPageProps) {
  const movieId = params.id;

  try {
    // 1. 在服务器上并行获取数据，并用 try...catch 包裹
    const [movie, comments] = await Promise.all([
      getMovieById(movieId),
      getCommentsByMovieId(movieId),
    ]);

    // console.log(`\n\n--- [前端调试日志] ---`);
    // console.log(`正在查看电影ID: ${movieId} 的评论`);
    // console.log("从后端API获取到的原始评论数据为:");
    // // 使用JSON.stringify可以更清晰地看到对象结构
    // console.log(JSON.stringify(comments, null, 2));
    // console.log(`--- [调试日志结束] ---\n\n`);

    // 2. 如果电影不存在，显示友好提示
    if (!movie) {
      return <div className="text-center text-xl mt-10">电影未找到</div>;
    }

    // 3. 将获取到的纯数据作为props，传递给客户端组件进行渲染
    return <MovieDetailsView movie={movie} comments={comments} />;
  } catch (error) {
    // 4. 如果在获取数据过程中发生任何错误（例如网络连接失败）
    // 在Next.js服务器的控制台（也就是您的VS Code终端）打印详细错误
    console.error(`====== 电影详情页 (ID: ${movieId}) 服务端渲染失败 ======`);
    console.error(error);

    // 5. 在页面上显示一个清晰的错误提示，而不是让整个应用崩溃
    return (
      <div className="text-center text-red-400 mt-10">
        <h2 className="text-2xl font-bold">页面加载失败</h2>
        <p className="mt-2">无法连接到后端服务或获取电影数据失败。</p>
        <p className="mt-1 text-sm text-gray-500">
          (详细错误请查看VS Code或服务器的终端日志)
        </p>
      </div>
    );
  }
}
