import mongoose from 'mongoose';

export const connectMongo = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
  console.log('📦 Connected to MongoDB');
};

