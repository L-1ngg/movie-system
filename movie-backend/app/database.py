from sqlalchemy import create_engine, Table, Column, Integer, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

connect_args = {"init_command": "SET time_zone = '+8:00'"}
engine = create_engine(settings.DATABASE_URL,connect_args=connect_args) # 在底层创建了一个连接池
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) # 从连接池当中借用链接,使用完后归还
Base = declarative_base()

# 中间表定义
MovieActors = Table(
    'MovieActors', Base.metadata,
    Column('MovieID', Integer, ForeignKey('Movies.MovieID', ondelete="CASCADE"), primary_key=True),
    Column('ActorID', Integer, ForeignKey('Actors.ActorID', ondelete="CASCADE"), primary_key=True)
)

MovieDirectors = Table(
    'MovieDirectors', Base.metadata,
    Column('MovieID', Integer, ForeignKey('Movies.MovieID', ondelete="CASCADE"), primary_key=True),
    Column('DirectorID', Integer, ForeignKey('Directors.DirectorID', ondelete="CASCADE"), primary_key=True)
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()