import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map((url) => url.trim()) : []),
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser tools without origin header.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Database Connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Leave Management API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
