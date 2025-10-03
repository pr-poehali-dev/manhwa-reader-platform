-- Таблица ролей пользователей
CREATE TABLE IF NOT EXISTS user_roles (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255),
    email VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица заявок на добавление тайтлов
CREATE TABLE IF NOT EXISTS manhwa_submissions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    title VARCHAR(500) NOT NULL,
    alternative_titles TEXT,
    description TEXT,
    cover_url TEXT,
    source_url TEXT,
    genres TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    rejection_reason TEXT,
    moderator_id VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    moderated_at TIMESTAMP,
    manhwa_id INTEGER
);

-- Таблица запросов на смену переводчика
CREATE TABLE IF NOT EXISTS translator_change_requests (
    id SERIAL PRIMARY KEY,
    manhwa_id INTEGER NOT NULL,
    current_team_id INTEGER,
    requesting_user_id VARCHAR(255) NOT NULL,
    requesting_username VARCHAR(255),
    new_team_id INTEGER,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    moderator_id VARCHAR(255),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    moderated_at TIMESTAMP
);

-- Таблица истории изменений
CREATE TABLE IF NOT EXISTS change_history (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    changes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица подписок на уведомления
CREATE TABLE IF NOT EXISTS notifications_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    manhwa_id INTEGER NOT NULL,
    notify_new_chapters BOOLEAN DEFAULT TRUE,
    notify_updates BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, manhwa_id)
);

-- Таблица уведомлений
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(500),
    message TEXT,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON manhwa_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON manhwa_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_translator_requests_status ON translator_change_requests(status);
CREATE INDEX IF NOT EXISTS idx_change_history_entity ON change_history(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON notifications_subscriptions(user_id);

-- Добавляем администратора по умолчанию (замени user_id на свой)
INSERT INTO user_roles (user_id, username, role) 
VALUES ('admin_default', 'Admin', 'admin') 
ON CONFLICT (user_id) DO NOTHING;
