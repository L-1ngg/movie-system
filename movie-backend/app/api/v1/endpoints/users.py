
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Annotated

from app.crud import crud_user
from app.schemas import user_schema
from app.core import security
from app.database import get_db
# 1. 从新的依赖文件中导入依赖项
from app.api.v1.dependencies import get_current_user,get_current_admin_user 
from app.models.user_model import User as UserModel

# 上传图像相关所需要的模块
from fastapi import UploadFile, File
import shutil
import uuid
from pathlib import Path

router = APIRouter()

@router.post("/register", response_model=user_schema.UserRead, status_code=status.HTTP_201_CREATED)
def register_user(user: user_schema.UserCreate, db: Session = Depends(get_db)):
    """
    用户注册
    """
    db_user = crud_user.get_user_by_email(db, email=user.Email)
    if db_user:
        raise HTTPException(status_code=400, detail="该邮箱已被注册")
    created_user = crud_user.create_user(db=db, user=user)
    return created_user

@router.post("/login/token", response_model=user_schema.Token)
def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)):
    """
    用户登录获取JWT
    """
    user = crud_user.get_user_by_email(db, email=form_data.username)
    if not user or not security.verify_password(form_data.password, user.PasswordHash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="邮箱或密码不正确",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(data={"sub": user.Email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=user_schema.UserRead)
def read_users_me(current_user: Annotated[UserModel, Depends(get_current_user)]):
    """
    获取当前登录用户的信息。
    这是一个受保护的端点。
    """
    # 不再直接返回数据库模型对象 current_user，
    # 而是根据 Pydantic 的 UserRead 模式，从 current_user 创建一个新的实例来返回。
    # 这可以避免 FastAPI 在自动序列化时可能遇到的未知问题。
    return user_schema.UserRead.from_orm(current_user)

@router.post("/me/avatar", response_model=user_schema.UserRead)
def upload_avatar_for_current_user(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    当前登录用户上传自己的头像。
    如果已有旧头像，会先删除旧头像文件。
    """
    save_dir = Path("static/images/avatars")
    save_dir.mkdir(parents=True, exist_ok=True)

    file_extension = Path(file.filename).suffix
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    save_path = save_dir / unique_filename

    # 1. 保存新文件 (已有逻辑)
    try:
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"无法保存文件: {e}")

    # 2. 删除旧头像 
    if current_user.AvatarURL:
        # 从相对URL /static/images/avatars/xxxx.jpg 构造出物理文件路径 static/images/avatars/xxxx.jpg
        # lstrip('/') 移除开头的斜杠，以正确拼接路径
        old_avatar_filepath = Path(current_user.AvatarURL.lstrip('/'))
        
        # 检查旧文件是否存在，防止因意外情况文件已被删除而报错
        if old_avatar_filepath.exists():
            try:
                old_avatar_filepath.unlink() # unlink() 就是删除文件
                print(f"--- [后端日志] 已成功删除旧头像: {old_avatar_filepath} ---")
            except OSError as e:
                # 即使删除失败，也只是打印一个错误，不中断整个上传流程
                print(f"--- [后端日志] 删除旧头像失败: {e} ---")
    
    # 3. 更新数据库中的URL为新头像的URL (已有逻辑)
    avatar_url = f"/static/images/avatars/{unique_filename}"
    updated_user = crud_user.update_user_avatar(db, user_id=current_user.UserID, avatar_url=avatar_url)
    
    return updated_user

@router.put("/me", response_model=user_schema.UserRead)
def update_current_user_info(
    user_update: user_schema.UserUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    当前登录用户更新自己的用户名或邮箱。
    """
    return crud_user.update_user(db=db, user_id=current_user.UserID, user_update=user_update)

@router.put("/{user_id}", response_model=user_schema.UserRead)
def update_user_by_id(
    user_id: int,
    user_update: user_schema.UserUpdate,
    db: Session = Depends(get_db),
    admin_user: UserModel = Depends(get_current_admin_user)
):
    """
    管理员根据用户ID更新指定用户的用户名或邮箱。
    """
    updated_user = crud_user.update_user(db=db, user_id=user_id, user_update=user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="用户未找到")
    return updated_user