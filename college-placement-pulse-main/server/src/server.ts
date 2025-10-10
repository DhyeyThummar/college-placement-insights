import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import app from './app.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/college-placement-insights';
const PORT = Number(process.env.PORT) || 5055;

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

start();


