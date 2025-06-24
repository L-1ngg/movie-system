-- Active: 1750344791443@@127.0.0.1@3306@movie_rating_system

-- 1. 插入用户数据
INSERT INTO Users (Username, Email, PasswordHash, Role) VALUES
('admin_user', 'admin@movies.com', 'hashed_password_placeholder_admin', 'admin'),
('alice', 'alice@email.com', 'hashed_password_placeholder_1', 'user'),
('bob', 'bob@email.com', 'hashed_password_placeholder_2', 'user'),
('charlie', 'charlie@email.com', 'hashed_password_placeholder_3', 'user');