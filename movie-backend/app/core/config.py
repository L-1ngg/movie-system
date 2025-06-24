# BaseSettings是一个基类,继承该类的类将获得读取环境变量和.env的能力
from pydantic_settings import BaseSettings
from pathlib import Path # 1. 导入 Path

# 构建到 .env 文件的绝对路径
# 这段代码的意思是：从当前文件(config.py)的位置出发，
# 向上走两层目录(core/ -> app/)到达项目根目录，然后找到.env文件
env_path = Path(__file__).parent.parent.parent / ".env"

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        # 3. 使用绝对路径
        env_file = env_path
        env_file_encoding = 'utf-8' # 加上编码格式(便于跨系统查找)

settings = Settings()