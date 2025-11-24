import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import investmentsRouter from './routes/investments';
import pricesRouter from './routes/prices';
import authRouter from './routes/auth';
import { authMiddleware } from './middleware/auth';
import { connectMongo } from './config/mongo';

// Load .env file from server root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Check environment variables
if (!process.env.MONGO_URI) {
  console.warn('⚠️  Warning: MONGO_URI not found in .env file');
  console.warn('   Please create a .env file in the server/ directory with:');
  console.warn('   MONGO_URI=your_mongodb_connection_string');
}
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  Warning: JWT_SECRET not found in .env file');
  console.warn('   Please add JWT_SECRET to your .env file for authentication.');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/investments', authMiddleware, investmentsRouter);
app.use('/api/prices', authMiddleware, pricesRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Investment Tracker API is running' });
});

connectMongo()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  });

