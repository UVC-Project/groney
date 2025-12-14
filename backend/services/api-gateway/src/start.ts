import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv';
import shopRoutes from './routes/shopRoutes';
import teacherRoutes from './routes/teacherRoutes';
import mapRoutes from './routes/mapRoutes';
import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';

config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));

// Auth endpoints MUST come BEFORE express.json() to allow proxy to forward raw body
app.use('/api/auth', authRoutes);

// Teacher endpoints (proxy routes - must come before body parser)
app.use('/api/teacher', teacherRoutes);

// Student endpoints (proxy routes - must come before body parser)
app.use('/api/student', studentRoutes);

// Mission endpoints (proxy routes)
app.use('/map', mapRoutes);

// Body parser for non-proxy routes
app.use(express.json());

// Shop endpoints (local routes that need body parsing)
app.use('/api', shopRoutes);

app.get('/', (_req, res) => {
  res.json({
    service: 'api-gateway',
    version: '1.0.0',
    status: 'running',
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

// 404 fallback MUST be last
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
