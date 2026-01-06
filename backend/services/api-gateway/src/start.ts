import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv';
import shopRoutes from './routes/shopRoutes';
import teacherRoutes from './routes/teacherRoutes';
import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';
import supplyRoutes from './routes/supplyRoutes';
import mascotRoutes from './routes/mascotRoutes';


config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));

// 1. Auth & Proxy routes (Must come before express.json() for proxying)
app.use('/api/auth', authRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);

// 2. Body Parser for standard API routes
app.use(express.json());

// 3. Service routes
app.use('/api', shopRoutes);
app.use('/api', mascotRoutes);
app.use('/api', supplyRoutes);

// 4. Health Checks (Available at both locations for compatibility)
const healthHandler = (_req: any, res: any) => {
  res.json({ status: 'ok', service: 'api-gateway', version: '1.0.0' });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

app.get('/', (_req, res) => {
  res.json({
    service: 'api-gateway',
    version: '1.0.0',
    status: 'running',
  });
});

// 404 fallback MUST be last
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested gateway endpoint does not exist',
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
