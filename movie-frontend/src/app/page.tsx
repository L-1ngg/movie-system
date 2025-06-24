import { getMovies } from "@/services/api";
import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";

interface HomePageProps {
  searchParams: {
    search?: string;
  };
}
export default async function HomePage({ searchParams }: HomePageProps) {
  // 3. 从 searchParams 中获取搜索词
  const searchTerm = searchParams.search || "";

  // 4. 将搜索词传递给 getMovies 函数
  const movies = await getMovies({ search: searchTerm });

  return (
    <div>
      {/* 5. 在页面上渲染搜索框 */}
      <SearchBar />

      <h1 className="text-3xl font-bold mb-6">
        {/* 根据是否有搜索词显示不同的标题 */}
        {searchTerm ? `“${searchTerm}”的搜索结果` : "热门电影"}
      </h1>

      {movies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.MovieID} movie={movie} />
          ))}
        </div>
      ) : (
        <p>未能找到相关电影。请尝试其他关键词或检查后端服务。</p>
      )}
    </div>
  );
}
