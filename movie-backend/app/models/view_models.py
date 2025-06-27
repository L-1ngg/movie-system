from sqlalchemy import Column, Integer, String, Text,INT
from sqlalchemy.ext.declarative import declarative_base

# from app.db.session import Base
# Base = declarative_base()
from app.database import Base

class VMovieDetails(Base):
    """
    这个模型类映射到数据库中的 V_MovieDetails 视图。
    """
    __tablename__ = 'V_MovieDetails'

    # 将视图的所有列都定义为模型的属性
    MovieID = Column(Integer, primary_key=True) # 视图也需要主键来进行 ORM 查询
    Title = Column(String)
    ReleaseYear = Column(INT)
    Synopsis = Column(Text)
    Actors = Column(String)    # 对应 GROUP_CONCAT 生成的演员列表字符串
    Directors = Column(String) # 对应 GROUP_CONCAT 生成的导演列表字符串
