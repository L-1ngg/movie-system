from sqlalchemy import Column, Integer, Text, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy.orm import relationship

class Comment(Base):
    __tablename__ = "Comments"

    CommentID = Column(Integer, primary_key=True, index=True)
    MovieID = Column(Integer, ForeignKey("Movies.MovieID", ondelete="CASCADE"), nullable=False)
    UserID = Column(Integer, ForeignKey("Users.UserID", ondelete="CASCADE"), nullable=False)
    Content = Column(Text, nullable=False)
    CreatedAt = Column(TIMESTAMP, server_default=func.now())
    
    user = relationship("User", back_populates="comments")