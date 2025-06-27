-- Active: 1750344791443@@127.0.0.1@3306@movie_rating_system
USE movie_rating_system;
use mysql;
-- 表：Users (用户)
CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL, -- 存储加密后的密码，绝不存明文
    Role ENUM('user', 'admin') NOT NULL DEFAULT 'user', -- 角色字段，默认为普通用户
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 表：Actors (演员)
CREATE TABLE Actors (
    ActorID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Gender ENUM('男', '女', '其他') DEFAULT '其他', -- 性别，设置默认值 
    BirthDate DATE,
    Nationality VARCHAR(50)
);
-- 表：Directors (导演)
CREATE TABLE Directors (
    DirectorID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Gender ENUM('男', '女', '其他') DEFAULT '其他', -- 性别，设置默认值 
    BirthDate DATE,
    Nationality VARCHAR(50)
);
-- 表：Movies (电影)
CREATE TABLE Movies (
    MovieID INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(255) NOT NULL, -- 电影名称，非空 
    ReleaseYear INT,
    Duration INT, -- 电影时长（分钟）
    Genre VARCHAR(100), -- 类型/流派
    Language VARCHAR(50),
    Country VARCHAR(50),
    Synopsis TEXT, -- 简介
    AverageRating DECIMAL(3, 1) NOT NULL DEFAULT 0.0, -- 评分，默认值为0 
    RatingCount INT NOT NULL DEFAULT 0 -- 评分人数，用于方便计算平均分
);
-- 链接表：MovieDirectors (电影-导演关系)
CREATE TABLE MovieDirectors (
    MovieID INT,
    DirectorID INT,
    PRIMARY KEY (MovieID, DirectorID), -- 复合主键
    FOREIGN KEY (MovieID) REFERENCES Movies(MovieID) ON DELETE CASCADE,
    FOREIGN KEY (DirectorID) REFERENCES Directors(DirectorID) ON DELETE CASCADE
);
-- 链接表：MovieActors (电影-演员关系)
CREATE TABLE MovieActors (
    MovieID INT,
    ActorID INT,
    PRIMARY KEY (MovieID, ActorID), -- 复合主键
    FOREIGN KEY (MovieID) REFERENCES Movies(MovieID) ON DELETE CASCADE,
    FOREIGN KEY (ActorID) REFERENCES Actors(ActorID) ON DELETE CASCADE
);

-- 表：Comments (评论)
CREATE TABLE Comments (
    CommentID INT AUTO_INCREMENT PRIMARY KEY,
    MovieID INT NOT NULL,
    UserID INT NOT NULL,
    Content TEXT NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (MovieID) REFERENCES Movies(MovieID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- 表：Ratings (用户评分记录)
CREATE TABLE Ratings (
    UserID INT NOT NULL,
    MovieID INT NOT NULL,
    Score INT NOT NULL, -- 评分为1-10的整数
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (UserID, MovieID), -- 复合主键，确保一个用户对一部电影只能评一次分
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (MovieID) REFERENCES Movies(MovieID) ON DELETE CASCADE,
    CHECK (Score >= 1 AND Score <= 10) -- 约束：评分在1到10之间
);