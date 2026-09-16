CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    course VARCHAR(100) NOT NULL CHECK (course IN ('Análise e Desenvolvimento de Sistemas', 'Técnico em Informática', 'Técnico em Informática (Integrado)')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mentor_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    skills TEXT NOT NULL,
    embedding TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    mentorships_completed INTEGER DEFAULT 0,
    average_rating REAL DEFAULT 5.0,
    status VARCHAR(20) DEFAULT 'approved',
    approved_by INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_description TEXT NOT NULL,
    embedding TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    mentor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    similarity_score REAL,
    ai_briefing TEXT,
    status VARCHAR(20) DEFAULT 'active',
    first_response_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    match_id INTEGER UNIQUE NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    mentor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
    was_resolved BOOLEAN DEFAULT TRUE,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- senha = 123456
INSERT INTO users (id, full_name, email, student_id, password_hash, course) VALUES
(1, 'marcos schlick', 'marcos@email.com', '20241.TDS01', '$2a$10$NZ5o7r2E.ayT2ZoxgjlI.eJ6OEYqjH7INR/F.mXDbjZJi9HF0YCVG', 'Análise e Desenvolvimento de Sistemas'),
(2, 'William Meireles', 'william@email.com', '20241.TDS02', '$2a$10$NZ5o7r2E.ayT2ZoxgjlI.eJ6OEYqjH7INR/F.mXDbjZJi9HF0YCVG', 'Análise e Desenvolvimento de Sistemas'),
(3, 'Bernardo Ribeiro', 'bernardo@email.com', '20241.TDS03', '$2a$10$NZ5o7r2E.ayT2ZoxgjlI.eJ6OEYqjH7INR/F.mXDbjZJi9HF0YCVG', 'Análise e Desenvolvimento de Sistemas'),
(4, 'calouro da silva', 'calouro@email.com', '2024.TDS1000', '$2a$10$NZ5o7r2E.ayT2ZoxgjlI.eJ6OEYqjH7INR/F.mXDbjZJi9HF0YCVG', 'Análise e Desenvolvimento de Sistemas')
ON CONFLICT (email) DO NOTHING;

SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));

INSERT INTO mentor_profiles (user_id, skills, points, level, mentorships_completed, average_rating, status) VALUES
(1, 'Python, FastAPI, React, Docker, Inteligência Artificial, PostgreSQL', 120, 3, 10, 5.0, 'approved'),
(2, 'TypeScript, Node.js, Frontend, CSS, WebGL, Three.js', 80, 2, 6, 4.9, 'approved'),
(3, 'Java, Spring Boot, Estrutura de Dados, Algoritmos, Banco de Dados', 50, 2, 4, 4.8, 'approved')
ON CONFLICT (user_id) DO NOTHING;