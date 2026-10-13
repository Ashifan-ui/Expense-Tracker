
import dns from 'node:dns';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

// Prefer IPv4 DNS resolution
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());

// Health check route
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Expense tracker API is running',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: 'Server error',
  });
});

// Connect to MongoDB Atlas and start server
const startServer = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error(
        'MONGO_URI is missing. Configure it in Vercel Environment Variables.'
      );
    }

    console.log('Connecting to MongoDB Atlas...');

    await mongoose.connect(mongoUri);

    console.log('MongoDB Atlas connected successfully');

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
