import express from 'express';
import mapRoutes from './routes/map.routes';
import teacherRoutes from './routes/teacher.routes';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    service: 'mission-service',
    version: '1.0.0',
    status: 'running',
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'mission-service' });
});

// Teacher routes
app.use('/api/teacher', teacherRoutes);

app.use('/map', mapRoutes);

// 404 handler for undefined routes
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
  });
});

app.listen(PORT, () => {
  console.log(`Mission Service running on port ${PORT}`);
});
