from pydantic import BaseModel
from typing import Optional,List # 类型提示
from . import actor_schema, director_schema

# 基础模式，包含所有电影共有的字段
class MovieBase(BaseModel):
    Title: str
    ReleaseYear: Optional[int] = None
    Duration: Optional[int] = None
    Genre: Optional[str] = None
    Language: Optional[str] = None
    Country: Optional[str] = None
    Synopsis: Optional[str] = None

# 用于创建电影的模式，继承自基础模式,并且增加两个字段
class MovieCreate(MovieBase):
    actor_ids: List[int] = []
    director_ids: List[int] = []

# 用于更新电影的模式，所有字段都是可选的
class MovieUpdate(BaseModel):
    Title: Optional[str] = None
    ReleaseYear: Optional[int] = None
    Duration: Optional[int] = None
    Genre: Optional[str] = None
    Language: Optional[str] = None
    Country: Optional[str] = None
    Synopsis: Optional[str] = None
    actor_ids: Optional[List[int]] = None
    director_ids: Optional[List[int]] = None

# 用于从API读取和返回电影数据的模式
class MovieRead(MovieBase):
    MovieID: int
    AverageRating: float
    RatingCount: int
    CoverURL: Optional[str] = None
    actors: List[actor_schema.ActorRead] = []
    directors: List[director_schema.DirectorRead] = []

    class Config:
        from_attributes = True # 兼容ORM模型