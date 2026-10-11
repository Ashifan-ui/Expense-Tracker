# Personal Expense Tracker

A full-stack MERN expense tracker with authentication, protected routes, and transaction management.

## Project Structure

- backend/
  - controllers/
  - middleware/
  - models/
  - routes/
  - server.js
- frontend/
  - src/
    - pages/
    - services/
  - package.json

## Backend Setup

1. Install backend dependencies:
   - cd backend
   - npm install
2. Create a .env file based on .env.example.
3. Start the backend:
   - npm start

## Frontend Setup

1. Install frontend dependencies:
   - cd frontend
   - npm install
2. Create a .env file based on .env.example.
3. Start the frontend:
   - npm run dev

## MongoDB Atlas Setup

1. Create a MongoDB Atlas cluster.
2. Create a database user.
3. Whitelist your IP address.
4. Copy the connection string into backend/.env as MONGO_URI.

## API Endpoints

- POST /api/auth/register
- POST /api/auth/login
- GET /api/transactions
- POST /api/transactions
- PUT /api/transactions/:id
- DELETE /api/transactions/:id
