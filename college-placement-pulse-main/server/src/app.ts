import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

import authRouter from './routes/auth.routes.js';
import placementRouter from './routes/placement.routes.js';
import collegeRouter from './routes/college.routes.js';
import analyticsRouter from './routes/analytics.routes.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Friendly root
app.get('/', (_req, res) => {
  res.json({ message: 'College Placement Insights API', health: '/api/health' });
});

// Avoid favicon 404 noise
app.get('/favicon.ico', (_req, res) => res.status(204).end());

app.use('/api', authRouter);
app.use('/api', placementRouter);
app.use('/api/colleges', collegeRouter);
app.use('/api/analytics', analyticsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;


