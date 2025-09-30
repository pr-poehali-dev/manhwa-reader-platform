CREATE TABLE IF NOT EXISTS manhwa (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_url TEXT,
    rating DECIMAL(3,1) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ongoing',
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS manhwa_genres (
    id SERIAL PRIMARY KEY,
    manhwa_id INTEGER REFERENCES manhwa(id),
    genre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS chapters (
    id SERIAL PRIMARY KEY,
    manhwa_id INTEGER REFERENCES manhwa(id),
    chapter_number INTEGER NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(manhwa_id, chapter_number)
);

CREATE TABLE IF NOT EXISTS pages (
    id SERIAL PRIMARY KEY,
    chapter_id INTEGER REFERENCES chapters(id),
    page_number INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    UNIQUE(chapter_id, page_number)
);

CREATE INDEX IF NOT EXISTS idx_manhwa_rating ON manhwa(rating DESC);
CREATE INDEX IF NOT EXISTS idx_manhwa_views ON manhwa(views DESC);
CREATE INDEX IF NOT EXISTS idx_manhwa_created ON manhwa(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chapters_manhwa ON chapters(manhwa_id, chapter_number);
CREATE INDEX IF NOT EXISTS idx_pages_chapter ON pages(chapter_id, page_number);