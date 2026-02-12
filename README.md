# Office Equipment Request System

A small internal tool for employees to request office equipment and for admins to manage requests.

## Features

- **Authentication**: Secure login with JWT.
- **Roles**:
  - **User**: View equipment, request equipment.
  - **Admin**: Add equipment, approve/reject requests.
- **Database**: PostgreSQL data persistence.

## Prerequisites

- Node.js (v20+)
- PostgreSQL (v12+)

## Installation

### 1. Database Setup

1. Create a PostgreSQL database (e.g., `office_equipment`).
2. Run the provided SQL script to create tables:
   ```bash
   psql -U your_postgres_user -d office_equipment -f database.sql
   ```
   (Alternatively, execute the commands in `database.sql` manually)

### 2. Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Create `.env` file (copy from `.env.example`):
     ```bash
     cp .env.example .env
     ```
   - Update `DATABASE_URL` and `JWT_SECRET` in `.env`.

4. Start the server:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```
   The backend runs on `http://localhost:5000`.

### 3. Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend runs on `http://localhost:5173`.

## Usage

1. Open `http://localhost:5173` in your browser.
2. Login with valid credentials.
   - You can create a user via the registration flow (if implemented) or seed the database manually.
3. **Admin Dashboard**: Manage equipment and requests.
4. **User Dashboard**: View and request equipment.

## Tech Stack

- **Frontend**: React, Vite
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Security**: JWT, bcrypt, RBAC

## Project Structure

- `backend/`: API server and database logic.
- `frontend/`: React application.
- `database.sql`: SQL schema for database setup.
