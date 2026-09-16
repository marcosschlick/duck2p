-- init.sql
CREATE TABLE IF NOT EXISTS mentors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    course VARCHAR(50) NOT NULL,
    contact VARCHAR(100) NOT NULL,
    skills TEXT NOT NULL,
    embedding TEXT
);

CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    course VARCHAR(50) NOT NULL,
    problem_description TEXT NOT NULL,
    embedding TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    mentor_id INTEGER REFERENCES mentors(id) ON DELETE CASCADE,
    similarity_score REAL,
    ai_briefing TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial mock data for testing
INSERT INTO mentors (name, course, contact, skills) VALUES
('Lucas Silva', 'TADS 4th Semester', '@lucas_dev', 'C language, pointers, malloc dynamic memory, segmentation fault'),
('Mariana Souza', 'TADS 6th Semester', '@mari_tech', 'Python, FastAPI, Docker, PostgreSQL database'),
('Carlos Pereira', 'Internet Informatics', '@carlinhos', 'HTML, CSS, basic JavaScript, programming logic');