CREATE OR REPLACE VIEW V_MovieDetails AS
SELECT
    m.MovieID,
    m.Title,
    m.ReleaseYear,
    m.`Synopsis`,
    -- 使用 GROUP_CONCAT 将多个演员/导演的名字合并成一个字符串，用逗号分隔
    GROUP_CONCAT(DISTINCT a.Name ORDER BY a.Name SEPARATOR ', ') AS Actors,
    GROUP_CONCAT(DISTINCT d.Name ORDER BY d.Name SEPARATOR ', ') AS Directors
FROM
    Movies m
    -- 使用 LEFT JOIN 以确保即使电影没有演员或导演，电影信息依然会显示
LEFT JOIN MovieActors ma ON m.MovieID = ma.MovieID
LEFT JOIN Actors a ON ma.ActorID = a.ActorID
LEFT JOIN MovieDirectors md ON m.MovieID = md.MovieID
LEFT JOIN Directors d ON md.DirectorID = d.DirectorID
GROUP BY
    -- 所有非聚合列都必须在 GROUP BY 中
    m.MovieID, m.Title, m.ReleaseYear, m.`Synopsis`;