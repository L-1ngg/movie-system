from pydantic import BaseModel
from typing import Optional # 类型提示

# 基础模式，包含所有电影共有的字段
class MovieBase(BaseModel):
    Title: str
    ReleaseYear: Optional[int] = None
    Duration: Optional[int] = None
    Genre: Optional[str] = None
    Language: Optional[str] = None
    Country: Optional[str] = None
    Synopsis: Optional[str] = None

# 用于创建电影的模式，继承自基础模式
class MovieCreate(MovieBase):
    pass

# 用于更新电影的模式，所有字段都是可选的
class MovieUpdate(BaseModel):
    Title: Optional[str] = None
    ReleaseYear: Optional[int] = None
    Duration: Optional[int] = None
    Genre: Optional[str] = None
    Language: Optional[str] = None
    Country: Optional[str] = None
    Synopsis: Optional[str] = None

# 用于从API读取和返回电影数据的模式
class MovieRead(MovieBase):
    MovieID: int
    AverageRating: float
    RatingCount: int
    CoverURL: Optional[str] = None

    class Config:
        from_attributes = True # 兼容ORM模型