import dns from 'node:dns';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

// Force Node.js to use IPv4 and public DNS servers
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

// Start server
const startServer = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    console.log('DNS servers used by Node:', dns.getServers());

    if (!mongoUri) {
      const memoryServer = await MongoMemoryServer.create();
      mongoUri = memoryServer.getUri();

      console.warn(
        'MONGO_URI is not set. Using in-memory MongoDB for local development.'
      );
    }

    console.log('Connecting to MongoDB...');

    await mongoose.connect(mongoUri);

    console.log('MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();