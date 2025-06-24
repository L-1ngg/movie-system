from fastapi import FastAPI
from starlette.staticfiles import StaticFiles
# 1. 从fastapi.middleware.cors导入CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware 
import os               # 1. 导入os模块
from pathlib import Path  # 2. 导入Path模块

from app.api.v1 import api
from app.database import Base, engine


# 这部分代码保持不变
ROOT_DIR = Path(__file__).resolve().parent.parent

app = FastAPI(title="电影评分系统 API")

# 2. 定义允许访问的源列表
#    在开发环境中，我们允许来自Next.js默认端口3000的请求
origins = [
    "http://localhost",
    "http://localhost:3000",
]

# 3. 添加CORS中间件到你的应用实例
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 允许访问的源
    allow_credentials=True, # 支持 cookie
    allow_methods=["*"],    # 允许所有方法
    allow_headers=["*"],    # 允许所有请求头
)

static_path = os.path.join(ROOT_DIR, "static")

# 确保在挂载前，目录是存在的
if not os.path.exists(static_path):
    os.makedirs(os.path.join(static_path, "images", "avatars"))
    os.makedirs(os.path.join(static_path, "images", "covers"))

app.mount("/static", StaticFiles(directory=static_path), name="static")

app.include_router(api.api_router, prefix="/api/v1")
# Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "欢迎使用电影评分系统 API"}