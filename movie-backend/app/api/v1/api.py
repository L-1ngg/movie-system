from fastapi import APIRouter
from app.api.v1.endpoints import users,movies, actors, directors,comments, ratings

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(movies.router, prefix="/movies", tags=["Movies"])
api_router.include_router(actors.router, prefix="/actors", tags=["Actors"])
api_router.include_router(directors.router, prefix="/directors", tags=["Directors"])
# 评论和打分的路由
api_router.include_router(comments.router, tags=["Comments"]) 
api_router.include_router(ratings.router, tags=["Ratings"])