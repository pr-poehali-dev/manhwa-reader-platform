CREATE TABLE manhwa (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    cover_url TEXT NOT NULL,
    description TEXT,
    rating DECIMAL(3,1) DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'ongoing',
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE manhwa_genres (
    manhwa_id INTEGER REFERENCES manhwa(id),
    genre_id INTEGER REFERENCES genres(id),
    PRIMARY KEY (manhwa_id, genre_id)
);

CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    manhwa_id INTEGER REFERENCES manhwa(id),
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(manhwa_id, chapter_number)
);

CREATE TABLE pages (
    id SERIAL PRIMARY KEY,
    chapter_id INTEGER REFERENCES chapters(id),
    page_number INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    UNIQUE(chapter_id, page_number)
);

CREATE INDEX idx_manhwa_rating ON manhwa(rating DESC);
CREATE INDEX idx_manhwa_views ON manhwa(views DESC);
CREATE INDEX idx_manhwa_created ON manhwa(created_at DESC);
CREATE INDEX idx_chapters_manhwa ON chapters(manhwa_id, chapter_number);
CREATE INDEX idx_pages_chapter ON pages(chapter_id, page_number);

INSERT INTO genres (name) VALUES 
    ('Боевик'),
    ('Фэнтези'),
    ('Приключения'),
    ('Драма'),
    ('Сёнэн'),
    ('Романтика'),
    ('Комедия'),
    ('Триллер');

INSERT INTO manhwa (title, cover_url, description, rating, views) VALUES
    ('Возвращение Мастера Меча', 'https://v3.fal.media/files/rabbit/Exk-Or9IWGWFNw_y6zO4q_output.png', 'История о мастере меча, вернувшемся в прошлое', 9.2, 2500000),
    ('Игрок Соло', 'https://v3.fal.media/files/rabbit/Exk-Or9IWGWFNw_y6zO4q_output.png', 'Слабейший охотник становится сильнейшим', 9.8, 5200000),
    ('Башня Бога', 'https://v3.fal.media/files/rabbit/Exk-Or9IWGWFNw_y6zO4q_output.png', 'Путешествие по таинственной башне', 9.5, 8900000),
    ('Всемогущий Лектор', 'https://v3.fal.media/files/rabbit/Exk-Or9IWGWFNw_y6zO4q_output.png', 'Профессор попал в мир своего романа', 8.9, 1800000),
    ('Убийца Демонов', 'https://v3.fal.media/files/rabbit/Exk-Or9IWGWFNw_y6zO4q_output.png', 'Борьба против демонов ради мести', 9.1, 3400000),
    ('Боевые Искусства Бессмертия', 'https://v3.fal.media/files/rabbit/Exk-Or9IWGWFNw_y6zO4q_output.png', 'Путь к вершине боевых искусств', 8.7, 2100000);

INSERT INTO manhwa_genres (manhwa_id, genre_id) VALUES
    (1, 1), (1, 2),
    (2, 1), (2, 2),
    (3, 3), (3, 2),
    (4, 4), (4, 2),
    (5, 1), (5, 5),
    (6, 1), (6, 3);

INSERT INTO chapters (manhwa_id, chapter_number, title) VALUES
    (1, 1, 'Возвращение'),
    (1, 2, 'Начало пути'),
    (2, 1, 'Двойное подземелье'),
    (2, 2, 'Система'),
    (3, 1, 'Башня открывается'),
    (3, 2, 'Первое испытание');

INSERT INTO pages (chapter_id, page_number, image_url)
SELECT c.id, generate_series(1, 40), 'https://v3.fal.media/files/rabbit/Exk-Or9IWGWFNw_y6zO4q_output.png'
FROM chapters c;