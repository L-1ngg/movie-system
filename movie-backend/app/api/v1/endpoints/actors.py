from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.crud import crud_actor
from app.schemas import actor_schema
from app.database import get_db
from app.api.v1.dependencies import get_current_admin_user
from app.models.user_model import User as UserModel

# 导入上传图片所需模块
from fastapi import UploadFile, File
import shutil
import uuid
from pathlib import Path

router = APIRouter()

@router.post("/", response_model=actor_schema.ActorRead, status_code=status.HTTP_201_CREATED)
def create_new_actor(
    actor: actor_schema.ActorCreate,
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(get_current_admin_user)
):
    """
    创建一个新的演员 (需要管理员权限)
    """
    return crud_actor.create_actor(db=db, actor=actor)

@router.get("/", response_model=List[actor_schema.ActorRead])
def read_all_actors(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    获取演员列表 (公开访问)
    """
    return crud_actor.get_actors(db, skip=skip, limit=limit)

@router.get("/{actor_id}", response_model=actor_schema.ActorRead)
def read_single_actor(actor_id: int, db: Session = Depends(get_db)):
    db_actor = crud_actor.get_actor(db, actor_id=actor_id)
    if db_actor is None:
        raise HTTPException(status_code=404, detail="演员未找到")
    return db_actor

@router.put("/{actor_id}", response_model=actor_schema.ActorRead)
def update_existing_actor(
    actor_id: int,
    actor_update: actor_schema.ActorUpdate,
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(get_current_admin_user)
):
    """
    更新一个演员的信息 (需要管理员权限)
    """
    db_actor = crud_actor.update_actor(db, actor_id=actor_id, actor_update=actor_update)
    if db_actor is None:
        raise HTTPException(status_code=404, detail="演员未找到")
    return db_actor

@router.delete("/{actor_id}", response_model=actor_schema.ActorRead)
def delete_existing_actor(
    actor_id: int,
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(get_current_admin_user)
):
    """
    删除一个演员 (需要管理员权限)
    """
    db_actor = crud_actor.delete_actor(db, actor_id=actor_id)
    if db_actor is None:
        raise HTTPException(status_code=404, detail="演员未找到")
    return db_actor

@router.post("/{actor_id}/photo", response_model=actor_schema.ActorRead)
def upload_photo_for_actor(
    actor_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(get_current_admin_user)
):
    """
    为指定演员上传封面 (需要管理员权限)
    如果已有旧照片，会先删除旧照片文件。
    """
    db_actor = crud_actor.get_actor(db, actor_id)
    if not db_actor:
        raise HTTPException(status_code=404, detail="演员未找到")

    save_dir = Path("static/images/actors")# 为演员创建单独的文件夹
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
    if db_actor.PhotoURL:
        old_photo_filepath = Path(db_actor.PhotoURL.lstrip('/'))
        if old_photo_filepath.exists():
            old_photo_filepath.unlink()

    photo_url = f"/static/images/actors/{unique_filename}"
    updated_actor = crud_actor.update_actor_photo(db, actor_id=actor_id, photo_url=photo_url)
    
    return updated_actor