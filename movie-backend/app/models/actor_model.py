from sqlalchemy import Column, Integer, String, Date, Enum
from sqlalchemy.orm import relationship
from app.database import Base, MovieActors # 从database导入

class Actor(Base):
    __tablename__ = "Actors"

    ActorID = Column(Integer, primary_key=True, index=True)
    Name = Column(String(100), nullable=False)
    Gender = Column(Enum('男', '女', '其他'), default='其他')
    BirthDate = Column(Date)
    Nationality = Column(String(50))
    PhotoURL = Column(String(255), nullable=True)

    # 使用字符串 "Movie" 声明关系
    movies = relationship("Movie", secondary=MovieActors, back_populates="actors")