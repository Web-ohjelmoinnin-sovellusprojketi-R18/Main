CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    tmdb_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    poster_url TEXT,
    release_date DATE,
    overview TEXT
);

CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, movie_id)
);

-- Insert test users (password is 'password' hashed with bcrypt)
-- Note: These are test hashes. In production, use proper password hashing.
INSERT INTO users (username, password_hash)
VALUES 
('testuser1', '$2a$10$abcdefghijklmnopqrstuuN9qo8uLOickgx2ZMRZoMyeIjZAgcfl0S2'),
('testuser2', '$2a$10$abcdefghijklmnopqrstuuN9qo8uLOickgx2ZMRZoMyeIjZAgcfl0S2'),
('testuser3', '$2a$10$abcdefghijklmnopqrstuuN9qo8uLOickgx2ZMRZoMyeIjZAgcfl0S2')
ON CONFLICT (username) DO NOTHING;

INSERT INTO movies (tmdb_id, title, poster_url, release_date)
VALUES 
(603, 'The Matrix', 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', '1999-03-31'),
(550, 'Fight Club', 'https://image.tmdb.org/t/p/w500/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg', '1999-10-15')
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON movies (tmdb_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites (user_id);