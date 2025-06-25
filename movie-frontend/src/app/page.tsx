import { getMovies, getGenres } from "@/services/api";
import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";

interface HomePageProps {
  searchParams: {
    search?: string;
    genre?: string;
    sort_by?: string;
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { search, genre, sort_by } = searchParams;
  const searchTerm = search || "";

  // 使用 let 定义，以便在 catch 块中可以重新赋值
  let movies = [];
  let genres = [];

  try {
    // 将数据获取逻辑包裹在 try...catch 中
    [movies, genres] = await Promise.all([
      getMovies({
        search: searchTerm,
        genre: genre,
        sort_by: sort_by,
      }),
      getGenres(),
    ]);
  } catch (error) {
    // 如果发生错误，在Next.js服务器的控制台打印详细错误
    console.error("====== 主页服务端渲染失败 ======");
    console.error(error);
    // 在页面上显示一个友好的错误提示，而不是让它崩溃
    return (
      <div className="text-center text-red-400 mt-10">
        <h2 className="text-2xl font-bold">页面加载失败</h2>
        <p className="mt-2">
          无法连接到后端服务,请确保后端API服务器已正确启动。
        </p>
        <p className="mt-1 text-sm text-gray-500">
          (详细错误请查看VS Code或服务器的终端日志)
        </p>
      </div>
    );
  }

  const pageTitle =
    searchTerm || genre ? `"${searchTerm || genre}" 的搜索结果` : "热门电影";

  return (
    <div>
      <SearchBar initialGenres={genres} />

      <h1 className="text-3xl font-bold mb-6 dark:text-white">{pageTitle}</h1>

      {movies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.MovieID} movie={movie} />
          ))}
        </div>
      ) : (
        <p className="text-gray-400">
          未能找到相关电影。请尝试其他关键词或筛选条件。
        </p>
      )}
    </div>
  );
}
