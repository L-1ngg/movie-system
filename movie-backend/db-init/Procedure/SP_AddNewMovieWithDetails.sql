
DELIMITER $$

CREATE PROCEDURE SP_AddNewMovieWithDetails(
    -- 输入参数
    IN p_MovieTitle VARCHAR(255),
    IN p_MovieSynopsis TEXT,
    IN p_ReleaseYear INT,
    IN p_ActorIDs TEXT,   -- 演员ID列表，用逗号分隔，例如 '1,5,10'
    IN p_DirectorIDs TEXT -- 导演ID列表，用逗号分隔，例如 '2,8'
)
BEGIN
    -- 声明变量
    DECLARE v_MovieID INT;

    -- 声明一个退出处理器，用于在发生错误时自动回滚
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        -- 发生错误，回滚事务
        ROLLBACK;
        -- 可以选择性地发出一个错误信号
        -- RESIGNAL;
    END;

    -- 开启事务
    START TRANSACTION;

    -- 1. 插入电影主信息
    INSERT INTO Movies (Title, Synopsis, ReleaseYear)
    VALUES (p_MovieTitle, p_MovieSynopsis, p_ReleaseYear);

    -- 获取刚刚插入的电影的ID
    SET v_MovieID = LAST_INSERT_ID();

    -- 2. 关联演员
    -- 如果演员ID列表不为空
    IF p_ActorIDs IS NOT NULL AND p_ActorIDs != '' THEN
        -- 使用循环或者更高效的方式处理字符串
        -- 这里用一个临时循环作为示例
        SET @sql = CONCAT('INSERT INTO MovieActors (MovieID, ActorID) SELECT ', v_MovieID, ', ActorID FROM Actors WHERE FIND_IN_SET(ActorID, "', p_ActorIDs, '")');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;

    -- 3. 关联导演
    IF p_DirectorIDs IS NOT NULL AND p_DirectorIDs != '' THEN
        SET @sql = CONCAT('INSERT INTO MovieDirectors (MovieID, DirectorID) SELECT ', v_MovieID, ', DirectorID FROM Directors WHERE FIND_IN_SET(DirectorID, "', p_DirectorIDs, '")');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;

    -- 所有操作成功，提交事务
    COMMIT;

END$$

-- 将分隔符恢复为默认值
DELIMITER ;