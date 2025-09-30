-- Таблица команд переводчиков
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    discord_url TEXT,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    member_count INT DEFAULT 1,
    manhwa_count INT DEFAULT 0
);

-- Таблица участников команд
CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    team_id INT NOT NULL REFERENCES teams(id),
    user_id VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

-- Таблица пользовательских загрузок манхв
CREATE TABLE user_uploads (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    alternative_titles TEXT,
    slug VARCHAR(500) NOT NULL UNIQUE,
    description TEXT,
    cover_url TEXT NOT NULL,
    author VARCHAR(255),
    artist VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ongoing',
    release_year INT,
    rating DECIMAL(3,2) DEFAULT 0.0,
    views INT DEFAULT 0,
    
    uploaded_by VARCHAR(255) NOT NULL,
    team_id INT REFERENCES teams(id),
    
    is_approved BOOLEAN DEFAULT FALSE,
    moderation_status VARCHAR(50) DEFAULT 'pending',
    moderation_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица жанров для пользовательских загрузок
CREATE TABLE user_upload_genres (
    id SERIAL PRIMARY KEY,
    upload_id INT NOT NULL REFERENCES user_uploads(id),
    genre_id INT NOT NULL REFERENCES genres(id),
    UNIQUE(upload_id, genre_id)
);

-- Таблица глав пользовательских загрузок
CREATE TABLE user_upload_chapters (
    id SERIAL PRIMARY KEY,
    upload_id INT NOT NULL REFERENCES user_uploads(id),
    chapter_number DECIMAL(10,2) NOT NULL,
    title VARCHAR(500),
    team_id INT REFERENCES teams(id),
    uploaded_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(upload_id, chapter_number)
);

-- Таблица страниц глав пользовательских загрузок
CREATE TABLE user_upload_pages (
    id SERIAL PRIMARY KEY,
    chapter_id INT NOT NULL REFERENCES user_upload_chapters(id),
    page_number INT NOT NULL,
    image_url TEXT NOT NULL,
    UNIQUE(chapter_id, page_number)
);

-- Индексы для оптимизации
CREATE INDEX idx_teams_slug ON teams(slug);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_user_uploads_slug ON user_uploads(slug);
CREATE INDEX idx_user_uploads_team ON user_uploads(team_id);
CREATE INDEX idx_user_uploads_status ON user_uploads(moderation_status);
CREATE INDEX idx_user_upload_chapters_upload ON user_upload_chapters(upload_id);