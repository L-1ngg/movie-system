from sqlalchemy.orm import Session, joinedload
from app.models import comment_model
from app.schemas import comment_schema

def create_comment(db: Session, comment: comment_schema.CommentCreate, user_id: int, movie_id: int):
    """
    创建评论，并确保返回的对象包含完整的用户信息。
    """
    db_comment = comment_model.Comment(
        Content=comment.Content,
        UserID=user_id,
        MovieID=movie_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)

    newly_created_comment = (
        db.query(comment_model.Comment)
        .options(joinedload(comment_model.Comment.user))
        .filter(comment_model.Comment.CommentID == db_comment.CommentID)
        .first()
    )
    return newly_created_comment

def get_comments_by_movie(db: Session, movie_id: int, skip: int = 0, limit: int = 100):
    """
    获取指定电影的所有评论，并预加载（join）关联的用户信息。
    同时支持分页功能。
    """
    return (
        db.query(comment_model.Comment)
        .options(joinedload(comment_model.Comment.user))
        .filter(comment_model.Comment.MovieID == movie_id)
        .order_by(comment_model.Comment.CreatedAt.desc())
        .offset(skip)  # <--- 添加 skip
        .limit(limit)  # <--- 添加 limit
        .all()
    )

def get_comment(db: Session, comment_id: int):
    return db.query(comment_model.Comment).filter(comment_model.Comment.CommentID == comment_id).first()

def update_comment(db: Session, comment_id: int, comment_update: comment_schema.CommentUpdate):
    db_comment = get_comment(db, comment_id)
    if not db_comment:
        return None
    db_comment.Content = comment_update.Content
    db.commit()
    db.refresh(db_comment)
    return db_comment

def delete_comment(db: Session, comment_id: int):
    db_comment = get_comment(db, comment_id)
    if not db_comment:
        return None
    db.delete(db_comment)
    db.commit()
    return db_comment