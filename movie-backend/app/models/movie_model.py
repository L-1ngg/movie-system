from sqlalchemy import Column, Integer, String, Text, DECIMAL
from sqlalchemy.orm import relationship
#  从database导入基类和关联表
from app.database import Base, MovieActors, MovieDirectors
class Movie(Base):
    __tablename__ = "Movies"

    MovieID = Column(Integer, primary_key=True, index=True)
    Title = Column(String(255), nullable=False)
    ReleaseYear = Column(Integer)
    Duration = Column(Integer)
    Genre = Column(String(100))
    Language = Column(String(50))
    Country = Column(String(50))
    Synopsis = Column(Text) # 简介
    AverageRating = Column(DECIMAL(3, 1), nullable=False, default=0.0)
    RatingCount = Column(Integer, nullable=False, default=0)
    CoverURL = Column(String(255), nullable=True)

    # 使用字符串 "Actor" 和 "Director" 来声明关系，避免直接导入
    actors = relationship("Actor", secondary=MovieActors, back_populates="movies")
    directors = relationship("Director", secondary=MovieDirectors, back_populates="movies")