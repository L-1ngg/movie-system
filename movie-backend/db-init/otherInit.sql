-- 5. 关联电影与导演 (假设ID从1开始自增)
-- MovieID=1: 肖申克的救赎, DirectorID=1: 弗兰克·德拉邦特
-- MovieID=2: 黑暗骑士, DirectorID=2: 克里斯托弗·诺兰
-- MovieID=3: 阿甘正传, DirectorID=3: 罗伯特·泽米吉斯
-- MovieID=4: 盗梦空间, DirectorID=2: 克里斯托弗·诺兰
-- MovieID=5: 霸王别姬, DirectorID=4: 陈凯歌
INSERT INTO MovieDirectors (MovieID, DirectorID) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 2),
(5, 4);

-- 6. 关联电影与演员
INSERT INTO MovieActors (MovieID, ActorID) VALUES
(1, 1), -- 肖申克的救赎 - 蒂姆·罗宾斯
(1, 2), -- 肖申克的救赎 - 摩根·弗里曼
(2, 3), -- 黑暗骑士 - 克里斯蒂安·贝尔
(2, 4), -- 黑暗骑士 - 希斯·莱杰
(3, 5), -- 阿甘正传 - 汤姆·汉克斯
(4, 6), -- 盗梦空间 - 莱昂纳多·迪卡普里奥
(5, 7), -- 霸王别姬 - 张国荣
(5, 8); -- 霸王别姬 - 巩俐

-- 7. 插入用户评分
-- UserID=2: alice, UserID=3: bob, UserID=4: charlie
INSERT INTO Ratings (UserID, MovieID, Score) VALUES
(2, 1, 10), -- alice给《肖申克的救赎》评了10分
(2, 4, 9),  -- alice给《盗梦空间》评了9分
(3, 1, 9),  -- bob给《肖申克的救赎》评了9分
(3, 2, 10), -- bob给《黑暗骑士》评了10分
(4, 1, 10), -- charlie给《肖申克的救赎》评了10分
(4, 2, 9),
(4, 3, 8),
(4, 4, 9),
(4, 5, 10);

-- 将定界符从 ; 更改为 //
DELIMITER //

CREATE TRIGGER TGR_After_Rating_Insert
-- 在 Ratings 表的插入操作之后（AFTER INSERT）触发
AFTER INSERT ON Ratings
-- 对每一行被插入的数据都执行
FOR EACH ROW
BEGIN
    -- 声明两个变量，用于存储计算出的新平均分和总评分数
    DECLARE new_avg_rating DECIMAL(3, 1);
    DECLARE new_rating_count INT;

    -- 1. 从 Ratings 表中，为刚刚被插入评分的电影（由 NEW.MovieID 确定）
    --    计算出它现在的总评分数和平均分。
    SELECT
        COUNT(*),      -- 计算总行数（即总评分数）
        AVG(Score)     -- 计算 Score 列的平均值
    INTO
        new_rating_count, -- 将总评分数存入变量
        new_avg_rating    -- 将平均分存入变量
    FROM
        Ratings
    WHERE
        MovieID = NEW.MovieID; -- NEW.MovieID 代表刚刚插入那一行数据的 MovieID

    -- 2. 更新 Movies 表中对应电影的记录
    UPDATE Movies
    SET
        AverageRating = new_avg_rating,
        RatingCount = new_rating_count
    WHERE
        MovieID = NEW.MovieID; -- 定位到需要更新的电影
END//

-- 将定界符恢复为 ;
DELIMITER ;

DELIMITER //

CREATE TRIGGER TGR_After_Rating_Update
AFTER UPDATE ON Ratings
FOR EACH ROW
BEGIN
    -- 如果评分值发生了变化
    IF NEW.Score <> OLD.Score THEN
        -- 逻辑与INSERT触发器完全相同，重新计算并更新电影的平均分
        UPDATE Movies
        SET AverageRating = (SELECT AVG(Score) FROM Ratings WHERE MovieID = NEW.MovieID),
            RatingCount = (SELECT COUNT(*) FROM Ratings WHERE MovieID = NEW.MovieID)
        WHERE MovieID = NEW.MovieID;
    END IF;
END//

DELIMITER ;

DELIMITER //

CREATE TRIGGER TGR_After_Rating_Delete
AFTER DELETE ON Ratings
FOR EACH ROW
BEGIN
    DECLARE new_avg_rating DECIMAL(3, 1) DEFAULT 0.0;
    DECLARE new_rating_count INT DEFAULT 0;

    -- 计算剩余评分的统计数据
    SELECT 
        COUNT(*),
        AVG(Score)
    INTO
        new_rating_count,
        new_avg_rating
    FROM 
        Ratings
    WHERE 
        MovieID = OLD.MovieID; -- OLD.MovieID 代表被删除那一行数据的 MovieID

    -- 更新 Movies 表。如果这是最后一条被删除的评分，AVG(Score)会是NULL，
    -- 我们需要将其处理为 0.0。
    UPDATE Movies
    SET
        AverageRating = COALESCE(new_avg_rating, 0.0), -- 如果new_avg_rating是NULL，则使用0.0
        RatingCount = new_rating_count
    WHERE
        MovieID = OLD.MovieID;
END//

DELIMITER ;

-- 8. 插入用户评论
INSERT INTO Comments (UserID, MovieID, Content) VALUES
(2, 1, '希望与自由，永不磨灭的经典！太感人了。'),
(3, 2, '希斯·莱杰的小丑是影史无法超越的丰碑。'),
(4, 5, '不疯魔，不成活。一部伟大的电影。');