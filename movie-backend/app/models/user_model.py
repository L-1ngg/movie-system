from sqlalchemy import Column, Integer, String, Enum
from app.database import Base
from sqlalchemy.orm import relationship 

class User(Base):
    __tablename__ = "Users"

    UserID = Column(Integer, primary_key=True, index=True)
    Username = Column(String(50), unique=True, index=True, nullable=False)
    Email = Column(String(100), unique=True, index=True, nullable=False)
    PasswordHash = Column(String(255), nullable=False)
    Role = Column(Enum('user', 'admin'), nullable=False, default='user')
    AvatarURL = Column(String(255), nullable=True) #新增一个上传自己的图片

    comments = relationship("Comment", back_populates="user")