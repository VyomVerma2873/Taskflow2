Build a full-stack web application called "TaskFlow" — 
an AI-Powered Task Management Portal.

## Tech Stack
- Backend: Java Spring Boot
- Frontend: React + Vite + Tailwind CSS
- Database: PostgreSQL
- AI Integration: Gemini API

## Authentication Module
- User Registration and Login
- JWT token generation and validation
- Protected API routes
- Password hashing using BCrypt

## Task Management Module
Full CRUD operations with the following task fields:
- Title
- Description
- Priority (LOW / MEDIUM / HIGH)
- Due Date
- Status (TODO / IN_PROGRESS / DONE)
- Created Timestamp

## AI Feature — Task Description Generator
- User inputs a Task Title
- Gemini API generates:
  - Task Description
  - Suggested Priority
  - Estimated completion time/effort
- Graceful fallback if Gemini API fails

## Architecture Requirements
- Backend: Layered architecture — Controller → Service → Repository
- Frontend: Component-based structure with auth state management 
  and form validation
- Environment variables for all secrets and API keys
- CORS configured for frontend-backend communication

## Deployment Configuration
- Backend: Deployable on Render
- Frontend: Deployable on Vercel
- Database: Neon (PostgreSQL)

## Deliverables
- Complete Spring Boot backend source code
- Complete React + Vite + Tailwind frontend source code
- PostgreSQL schema and JPA entity classes
- README with setup instructions, API endpoints, 
  architecture overview, and AI integration explanation
- Sample .env file with placeholder values