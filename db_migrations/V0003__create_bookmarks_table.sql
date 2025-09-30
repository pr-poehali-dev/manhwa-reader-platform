CREATE TABLE IF NOT EXISTS t_p15993318_manhwa_reader_platfo.bookmarks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    manhwa_id INTEGER REFERENCES t_p15993318_manhwa_reader_platfo.manhwa(id),
    chapter_id INTEGER REFERENCES t_p15993318_manhwa_reader_platfo.chapters(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, manhwa_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON t_p15993318_manhwa_reader_platfo.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_manhwa ON t_p15993318_manhwa_reader_platfo.bookmarks(manhwa_id);