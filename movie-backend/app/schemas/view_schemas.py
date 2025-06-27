from pydantic import BaseModel
from typing import Optional

# 这个 Schema 定义了从 API 返回的电影详情数据的结构
class MovieDetails(BaseModel):
    MovieID: int
    Title: str
    ReleaseYear: Optional[int] = None
    Synopsis: Optional[str] = None
    Actors: Optional[str] = None     
    Directors: Optional[str] = None

    # 配置 orm_mode (在Pydantic V2中是 from_attributes)
    # 使得 Pydantic可以直接从 SQLAlchemy 模型实例中读取数据
    class Config:
        from_attributes = True