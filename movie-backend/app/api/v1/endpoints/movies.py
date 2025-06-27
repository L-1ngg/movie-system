from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.crud import crud_movie
from app.schemas import movie_schema
from app.database import get_db

from app.crud.crud_view import movie_view
from app.schemas.view_schemas import MovieDetails

# 导入管理员验证依赖
from app.api.v1.dependencies import get_current_admin_user 
from app.models.user_model import User as UserModel

# 导入上传图片所需模块
from fastapi import UploadFile, File
import shutil
import uuid
from pathlib import Path

router = APIRouter()

@router.post("/", response_model=movie_schema.MovieRead, status_code=status.HTTP_201_CREATED)
def create_new_movie(
    movie: movie_schema.MovieCreate,
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(get_current_admin_user)
):
    """
    创建一个新的电影条目 (需要管理员权限)
    """
    return crud_movie.create_movie(db=db, movie=movie)

@router.get("/", response_model=List[movie_schema.MovieRead])
def read_all_movies(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None, description="按电影名、演员或导演名进行搜索"),
    genre: Optional[str] = Query(None, description="按类型/流派筛选，例如：剧情"),
    year: Optional[int] = Query(None, description="按发行年份筛选,例如:1994"),
    min_rating: Optional[float] = Query(None, ge=0, le=10, description="按最低评分筛选,范围0-10"),
    sort_by: Optional[str] = Query(None, description="排序方式: 'release_year_desc' 或 'rating_desc'"),
    skip: int = 0, 
    limit: int = 100, 
):
    """
    获取电影列表，支持按类型、年份和最低评分进行组合查询。
    """
    movies = crud_movie.get_movies(
        db, 
        genre=genre, 
        year=year, 
        min_rating=min_rating,
        search=search,
        sort_by=sort_by,
        skip=skip, 
        limit=limit
    )
    return movies

@router.get("/{movie_id}/details", response_model=MovieDetails)
def read_movie_details(
    *,
    db: Session = Depends(get_db),
    movie_id: int,
):
    """
    获取一部电影的完整详细信息 (通过视图 V_MovieDetails)。
    包括电影本身信息、演员列表和导演列表。
    """
   
    movie_details = movie_view.get_details(db=db, movie_id=movie_id)

    if not movie_details:
        raise HTTPException(
            status_code=404,
            detail="Movie with this ID not found",
        )

    # FastAPI 会自动使用 MovieDetailsSchema 将返回的 ORM 对象序列化为 JSON
    return movie_details

@router.get("/{movie_id}", response_model=movie_schema.MovieRead)
def read_single_movie(movie_id: int, db: Session = Depends(get_db)):
    """
    获取单个电影的详细信息 (公开访问)
    """
    db_movie = crud_movie.get_movie(db, movie_id=movie_id)
    if db_movie is None:
        raise HTTPException(status_code=404, detail="电影未找到")
    return db_movie

@router.put("/{movie_id}", response_model=movie_schema.MovieRead)
def update_existing_movie(
    movie_id: int,
    movie_update: movie_schema.MovieUpdate,
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(get_current_admin_user)
):
    """
    更新一个已存在的电影条目 (需要管理员权限)
    """
    db_movie = crud_movie.update_movie(db, movie_id=movie_id, movie_update=movie_update)
    if db_movie is None:
        raise HTTPException(status_code=404, detail="电影未找到")
    return db_movie

@router.delete("/{movie_id}", response_model=movie_schema.MovieRead)
def delete_existing_movie(
    movie_id: int,
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(get_current_admin_user)
):
    """
    删除一个电影条目 (需要管理员权限)
    """
    db_movie = crud_movie.delete_movie(db, movie_id=movie_id)
    if db_movie is None:
        raise HTTPException(status_code=404, detail="电影未找到")
    return db_movie

@router.post("/{movie_id}/cover", response_model=movie_schema.MovieRead)
def upload_cover_for_movie(
    movie_id: int,
    file: UploadFile = File(...), # File(...)表明该参数是必须的
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(get_current_admin_user)
):
    """
    为指定电影上传封面 (需要管理员权限)。
    如果已有旧封面，会先删除旧封面文件。
    """
    db_movie = crud_movie.get_movie(db, movie_id)
    if not db_movie:
        raise HTTPException(status_code=404, detail="电影未找到")

    save_dir = Path("static/images/covers")
    save_dir.mkdir(parents=True, exist_ok=True)
    
    # 1.提取文件的扩展名 2.调用uuid库生成唯一标识符并且拼接
    file_extension = Path(file.filename).suffix 
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    save_path = save_dir / unique_filename

    # 1. 保存新文件-上下文管理器
    try:
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"无法保存文件: {e}")

    # 2. 删除旧封面
    if db_movie.CoverURL:
        # 从相对URL /static/path/to/image.jpg 构造出物理文件路径 static/path/to/image.jpg
        old_cover_filepath = Path(db_movie.CoverURL.lstrip('/'))
        if old_cover_filepath.exists():
            try:
                old_cover_filepath.unlink() # 删除文件
                print(f"--- [后端日志] 已成功删除旧封面: {old_cover_filepath} ---")
            except OSError as e:
                print(f"--- [后端日志] 删除旧封面失败: {e} ---")
    
    # 3. 更新数据库中的URL为新封面的URL
    cover_url = f"/static/images/covers/{unique_filename}"
    updated_movie = crud_movie.update_movie_cover(db, movie_id=movie_id, cover_url=cover_url)
    
    return updated_movie

@router.get("/genres/", response_model=List[str])
def get_all_genres(db: Session = Depends(get_db)):
    """
    获取所有不重复的电影类型列表。
    """
    return crud_movie.get_genres(db=db)
