from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.crud import crud_director
from app.schemas import director_schema
from app.database import get_db
from app.api.v1.dependencies import get_current_admin_user
from app.models.user_model import User as UserModel

# 导入上传图片所需模块
from fastapi import UploadFile, File
import shutil
import uuid
from pathlib import Path

router = APIRouter()

@router.post("/", response_model=director_schema.DirectorRead, status_code=status.HTTP_201_CREATED)
def create_new_director(
    director: director_schema.DirectorCreate,
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(get_current_admin_user)
):
    """
    创建一个新的导演 (需要管理员权限)
    """
    return crud_director.create_director(db=db, director=director)

@router.get("/", response_model=List[director_schema.DirectorRead])
def read_all_directors(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    获取导演列表 (公开访问)
    """
    return crud_director.get_directors(db, skip=skip, limit=limit)

@router.get("/{director_id}", response_model=director_schema.DirectorRead)
def read_single_director(director_id: int, db: Session = Depends(get_db)):
    db_director = crud_director.get_director(db, director_id=director_id)
    if db_director is None:
        raise HTTPException(status_code=404, detail="导演未找到")
    return db_director

@router.put("/{director_id}", response_model=director_schema.DirectorRead)
def update_existing_director(
    director_id: int,
    director_update: director_schema.DirectorUpdate,
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(get_current_admin_user)
):
    """
    更新一个导演的信息 (需要管理员权限)
    """
    db_director = crud_director.update_director(db, director_id=director_id, director_update=director_update)
    if db_director is None:
        raise HTTPException(status_code=404, detail="导演未找到")
    return db_director

@router.delete("/{director_id}", response_model=director_schema.DirectorRead)
def delete_existing_director(
    director_id: int,
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(get_current_admin_user)
):
    """
    删除一个导演 (需要管理员权限)
    """
    db_director = crud_director.delete_director(db, director_id=director_id)
    if db_director is None:
        raise HTTPException(status_code=404, detail="导演未找到")
    return db_director

@router.post("/{director_id}/photo", response_model=director_schema.DirectorRead)
def upload_photo_for_director(
    director_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(get_current_admin_user)
):
    """
    为指定导演上传照片 (需要管理员权限)。
    如果已有旧照片，会先删除旧照片文件。
    """
    db_director = crud_director.get_director(db, director_id)
    if not db_director:
        raise HTTPException(status_code=404, detail="导演未找到")

    save_dir = Path("static/images/directors") # 为导演创建单独的文件夹
    save_dir.mkdir(parents=True, exist_ok=True)
    
    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    save_path = save_dir / unique_filename

    try:
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"无法保存文件: {e}")

    # 删除旧照片
    if db_director.PhotoURL:
        old_photo_filepath = Path(db_director.PhotoURL.lstrip('/'))
        if old_photo_filepath.exists():
            old_photo_filepath.unlink()
    
    photo_url = f"/static/images/directors/{unique_filename}"
    updated_director = crud_director.update_director_photo(db, director_id=director_id, photo_url=photo_url)
    
    return updated_director