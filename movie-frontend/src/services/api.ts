const API_BASE_URL = "http://127.0.0.1:8000/api/v1";
import { getToken } from "@/lib/auth";
// ==================================
// TypeScript 类型定义 (Types)
// ==================================

export type UserProfile = {
  UserID: number;
  Username: string;
  Email: string;
  Role: "user" | "admin";
  AvatarURL: string | null;
};

export type UserRegistrationData = {
  Username: string;
  Email: string;
  password: string;
};

export type UserProfileUpdateData = {
  Username?: string;
  Email?: string;
};

export interface UserPasswordUpdate {
  current_password: string;
  new_password: string;
}

export type UserLoginData = {
  email: string;
  password: string;
};

export type Movie = {
  MovieID: number;
  Title: string;
  ReleaseYear: number | null;
  Duration: number | null;
  Genre: string | null;
  Language: string | null;
  Country: string | null;
  Synopsis: string | null;
  AverageRating: number;
  RatingCount: number;
  CoverURL: string | null;
  actors: Actor[];
  directors: Director[];
};

export type MovieCreateData = {
  Title: string;
  ReleaseYear: number | null;
  Genre: string | null;
  Synopsis?: string;
  Country?: string;
  Language?: string;
  Duration?: number;
  actor_ids?: number[];
  director_ids?: number[];
};

export type MovieUpdateData = MovieCreateData;

// 定义查询参数的类型，让代码更清晰
type MovieQueryParams = {
  genre?: string;
  year?: number;
  min_rating?: number;
  search?: string;
};

export type Actor = {
  ActorID: number;
  Name: string;
  Gender: string | null;
  BirthDate: string | null;
  Nationality: string | null;
  PhotoURL: string | null;
};

export type ActorFormData = {
  Name: string;
  Gender: string | null;
  BirthDate: string | null;
  Nationality: string | null;
};

export type Director = {
  DirectorID: number;
  Name: string;
  Gender: string | null;
  BirthDate: string | null;
  Nationality: string | null;
  PhotoURL: string | null;
};

export type DirectorFormData = {
  Name: string;
  Gender: string | null;
  BirthDate: string | null;
  Nationality: string | null;
};

export type Comment = {
  CommentID: number;
  MovieID: number;
  UserID: number;
  Content: string;
  CreatedAt: string;
};

// ==================================
// API 调用函数 (Functions)
// ==================================

// ===== 用户 (Users) =====

export const registerUser = async (userData: UserRegistrationData) => {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "注册失败");
  }
  return response.json();
};

export const loginUser = async (credentials: UserLoginData) => {
  const formData = new URLSearchParams();
  formData.append("username", credentials.email);
  formData.append("password", credentials.password);
  const response = await fetch(`${API_BASE_URL}/users/login/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "登录失败");
  }
  return response.json();
};

export const getCurrentUser = async (token: string): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("获取用户信息失败");
  return response.json();
};

export const uploadAvatar = async (
  file: File,
  token: string
): Promise<UserProfile> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "上传头像失败");
  }
  return response.json();
};

export const updateUserPassword = async (
  payload: UserPasswordUpdate
): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error("No auth token found");

  const response = await fetch(`${API_BASE_URL}/users/me/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // 如果响应状态码不是2xx，尝试解析错误信息
    const errorData = await response
      .json()
      .catch(() => ({ detail: "密码更新失败" }));
    throw new Error(errorData.detail || "密码更新失败");
  }

  // 204 No Content 响应没有 body，所以这里不需要解析
};

// ===== 电影 (Movies) =====

export const getMovies = async (
  params: MovieQueryParams = {}
): Promise<Movie[]> => {
  // 1. 创建一个空对象，用于存放处理过的、类型安全的查询参数
  const queryParams: Record<string, string> = {};

  // 2. 遍历传入的参数对象，只将有效的值添加到新对象中
  for (const [key, value] of Object.entries(params)) {
    // 确保值不是 undefined 或 null
    if (value !== undefined && value !== null) {
      // 将所有值都转换为字符串，以满足URLSearchParams的要求
      queryParams[key] = String(value);
    }
  }

  // 3. 使用这个干净、类型安全的对象来创建查询字符串
  const query = new URLSearchParams(queryParams).toString();

  const response = await fetch(`${API_BASE_URL}/movies/?${query}`);
  if (!response.ok) throw new Error("获取电影列表失败");
  return response.json();
};

export const getMovieById = async (id: string): Promise<Movie | null> => {
  const response = await fetch(`${API_BASE_URL}/movies/${id}`);
  if (!response.ok) return null;
  return response.json();
};

export const createMovie = async (movieData: MovieCreateData, token: string) => {
  const response = await fetch(`${API_BASE_URL}/movies/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(movieData),
  });
  if (!response.ok) throw new Error("创建电影失败");
  return response.json();
};

export const updateMovie = async (
  movieId: number,
  movieData: MovieCreateData,
  token: string
) => {
  const response = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(movieData),
  });
  if (!response.ok) throw new Error("更新电影失败");
  return response.json();
};

export const deleteMovie = async (movieId: number, token: string) => {
  const response = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("删除电影失败");
  return response.json();
};

export const uploadMovieCover = async (
  movieId: number,
  file: File,
  token: string
): Promise<Movie> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE_URL}/movies/${movieId}/cover`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "上传封面失败");
  }
  return response.json();
};

// ===== 演员 (Actors) =====

export const getActors = async (): Promise<Actor[]> => {
  const response = await fetch(`${API_BASE_URL}/actors/`);
  if (!response.ok) throw new Error("获取演员列表失败");
  return response.json();
};

export const createActor = async (actorData: ActorFormData, token: string) => {
  const response = await fetch(`${API_BASE_URL}/actors/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(actorData),
  });
  if (!response.ok) throw new Error("创建演员失败");
  return response.json();
};

export const updateActor = async (
  actorId: number,
  actorData: ActorFormData,
  token: string
) => {
  const response = await fetch(`${API_BASE_URL}/actors/${actorId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(actorData),
  });
  if (!response.ok) throw new Error("更新演员失败");
  return response.json();
};

export const deleteActor = async (actorId: number, token: string) => {
  const response = await fetch(`${API_BASE_URL}/actors/${actorId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("删除演员失败");
  return response.json();
};

export const uploadActorPhoto = async (
  actorId: number,
  file: File,
  token: string
): Promise<Actor> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE_URL}/actors/${actorId}/photo`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "上传照片失败");
  }
  return response.json();
};

// ===== 导演 (Directors) =====

export const getDirectors = async (): Promise<Director[]> => {
  const response = await fetch(`${API_BASE_URL}/directors/`);
  if (!response.ok) throw new Error("获取导演列表失败");
  return response.json();
};

export const createDirector = async (
  directorData: DirectorFormData,
  token: string
) => {
  const response = await fetch(`${API_BASE_URL}/directors/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(directorData),
  });
  if (!response.ok) throw new Error("创建导演失败");
  return response.json();
};

export const updateDirector = async (
  directorId: number,
  directorData: DirectorFormData,
  token: string
) => {
  const response = await fetch(`${API_BASE_URL}/directors/${directorId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(directorData),
  });
  if (!response.ok) throw new Error("更新导演失败");
  return response.json();
};

export const deleteDirector = async (directorId: number, token: string) => {
  const response = await fetch(`${API_BASE_URL}/directors/${directorId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("删除导演失败");
  return response.json();
};

export const uploadDirectorPhoto = async (
  directorId: number,
  file: File,
  token: string
): Promise<Director> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(
    `${API_BASE_URL}/directors/${directorId}/photo`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "上传照片失败");
  }
  return response.json();
};

// ===== 评论 & 评分 (Comments & Ratings) =====

export const getCommentsByMovieId = async (id: string): Promise<Comment[]> => {
  const response = await fetch(`${API_BASE_URL}/movies/${id}/comments`);
  if (!response.ok) return [];
  return response.json();
};

export const postComment = async (
  movieId: string,
  content: string,
  token: string
): Promise<Comment> => {
  const response = await fetch(`${API_BASE_URL}/movies/${movieId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ Content: content }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "发表评论失败");
  }
  return response.json();
};

export const postRating = async (
  movieId: string,
  score: number,
  token: string
) => {
  const response = await fetch(`${API_BASE_URL}/movies/${movieId}/ratings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ Score: score }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "评分失败");
  }
  return response.json();
};

export const updateCurrentUser = async (
  userData: UserProfileUpdateData,
  token: string
): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "更新失败");
  }
  return response.json();
};
