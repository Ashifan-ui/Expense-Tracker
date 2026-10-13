
import dns from 'node:dns';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Expense tracker API is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
  });
});

let connectionPromise;

async function connectToMongoDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is missing from environment variables.');
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongoUri).catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  await connectionPromise;
}

// Vercel needs an exported request handler.
export default async function handler(req, res) {
  try {
    await connectToMongoDB();
    return app(req, res);
  } catch (error) {
    console.error('Backend startup error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
    });
  }
}

// Keep local development working with npm start.
if (!process.env.VERCEL) {
  connectToMongoDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Failed to start server:', error.message);
      process.exit(1);
    });
}
