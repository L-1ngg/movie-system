from fastapi import FastAPI
from starlette.staticfiles import StaticFiles

from fastapi.middleware.cors import CORSMiddleware 
import os               # 1. 导入os模块
from pathlib import Path  # 2. 导入Path模块

from app.api.v1 import api
from app.database import Base, engine

# 这部分代码保持不变
ROOT_DIR = Path(__file__).resolve().parent.parent

app = FastAPI(title="电影评分系统 API")

# 定义允许访问的源列表
# Access-Control-Allow-Origin
origins = [
    "http://localhost",
    "http://localhost:3000",
]

# 添加CORS(跨资源共享)中间件到你的应用实例
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 允许访问的源
    allow_credentials=True, # 支持 cookie
    allow_methods=["*"],    # 允许所有方法
    allow_headers=["*"],    # 允许所有请求头
)

static_path = os.path.join(ROOT_DIR, "static")

# 确保目录是存在的
if not os.path.exists(static_path):
    os.makedirs(os.path.join(static_path, "images", "avatars"))
    os.makedirs(os.path.join(static_path, "images", "covers"))
    os.makedirs(os.path.join(static_path, "images", "directprs"))
    os.makedirs(os.path.join(static_path, "images", "actors"))

# StaticFiles(静态文件服务程序) 是一个专门用来提供静态文件服务的应用。
app.mount("/static", StaticFiles(directory=static_path), name="static")

app.include_router(api.api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "欢迎使用电影评分系统 API"}