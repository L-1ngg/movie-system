from sqlalchemy import create_engine, Table, Column, Integer, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ▼▼▼ 新增：将中间表定义移到此处 ▼▼▼
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
# ▲▲▲ 新增结束 ▲▲▲

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()