from sqlalchemy import Column, Integer, TIMESTAMP, ForeignKey, CheckConstraint
from sqlalchemy.sql import func
from app.database import Base

class Rating(Base):
    __tablename__ = "Ratings"

    UserID = Column(Integer, ForeignKey("Users.UserID", ondelete="CASCADE"), primary_key=True)
    MovieID = Column(Integer, ForeignKey("Movies.MovieID", ondelete="CASCADE"), primary_key=True)
    Score = Column(Integer, nullable=False)
    CreatedAt = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint('Score >= 1 AND Score <= 10', name='score_check'),
    )