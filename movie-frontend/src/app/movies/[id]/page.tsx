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

  // 在服务器上并行获取数据
  const [movie, comments] = await Promise.all([
    getMovieById(movieId),
    getCommentsByMovieId(movieId),
  ]);

  if (!movie) {
    return <div className="text-center text-xl mt-10">电影未找到</div>;
  }

  // 将获取到的纯数据作为props，传递给客户端组件进行渲染
  return <MovieDetailsView movie={movie} comments={comments} />;
}
