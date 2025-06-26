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