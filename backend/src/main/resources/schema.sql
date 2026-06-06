-- PostgreSQL Database Schema for TaskFlow

-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Create tasks table
CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    priority VARCHAR(10) NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH'
    status VARCHAR(20) NOT NULL,   -- 'TODO', 'IN_PROGRESS', 'DONE'
    due_date TIMESTAMP,
    estimated_time VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE
);

-- Index user_id in tasks for faster lookups
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
