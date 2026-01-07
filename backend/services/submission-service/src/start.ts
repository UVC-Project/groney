import express from 'express';
import { config } from 'dotenv';
import teacherRoutes from './routes/teacher.routes';
import studentRoutes from './routes/student.routes';
import { ensureBucketExists } from './lib/s3';

config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    service: 'submission-service',
    version: '1.0.0',
    status: 'running',
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'submission-service' });
});

// Teacher routes
app.use('/api/teacher', teacherRoutes);

// Student routes (for photo uploads)
app.use('/api/student', studentRoutes);

// 404 handler for undefined routes
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
  });
});

// Initialize S3 bucket and start server
async function start() {
  try {
    await ensureBucketExists();
    console.log('✅ S3/MinIO initialized');
  } catch (error) {
    console.warn('⚠️ Could not initialize S3/MinIO bucket. File uploads may fail:', error);
  }

  app.listen(PORT, () => {
    console.log(`Submission Service running on port ${PORT}`);
  });
}

start();
