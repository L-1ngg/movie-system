-- 1. 创建用于存放日志的表
CREATE TABLE AuditLog (
    LogID INT AUTO_INCREMENT,
    TableName VARCHAR(100) NOT NULL,
    RecordID VARCHAR(255) NOT NULL,
    OldValue TEXT,
    NewValue TEXT,
    ChangeTimestamp DATETIME  DEFAULT CURRENT_TIMESTAMP,
    ChangedBy VARCHAR(100),

    PRIMARY KEY (LogID)
) COMMENT '用于记录数据变更的审计日志表';

-- 2. 创建触发器
DELIMITER $$

CREATE TRIGGER TRG_LogMovieChanges
-- 在 Movies 表的每一行被更新之后 (AFTER UPDATE) 触发
AFTER UPDATE ON Movies
FOR EACH ROW
BEGIN
    -- 检查标题是否发生变化
    IF OLD.Title != NEW.Title THEN
        INSERT INTO AuditLog (TableName, RecordID, OldValue, NewValue, ChangedBy)
        VALUES ('Movies', OLD.MovieID, CONCAT('Title: ', OLD.Title), CONCAT('Title: ', NEW.Title), USER());
    END IF;
    -- 检查描述是否发生变化
    IF OLD.Synopsis != NEW.Synopsis THEN
        INSERT INTO AuditLog (TableName, RecordID, OldValue, NewValue, ChangedBy)
        VALUES ('Movies', OLD.MovieID, CONCAT('Synopsis: ', OLD.Synopsis), CONCAT('Synopsis: ', NEW.Synopsis), USER());
    END IF;
END$$

DELIMITER ;

SELECT VERSION();