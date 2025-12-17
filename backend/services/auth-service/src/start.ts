import express from 'express';
import { config } from 'dotenv';
import RegisterController from './app/Controllers/RegisterController';
import LoginController from './app/Controllers/LoginController';
import LogoutController from './app/Controllers/LogoutController';
import PasswordResetController from './app/Controllers/PasswordResetController';
import teacherRoutes from './routes/teacher.routes';

config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    service: 'auth-service',
    version: '1.0.0',
    status: 'running',
  });
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

// Teacher routes
app.use('/api/teacher', teacherRoutes);

// Auth routes
app.post('/api/auth/login', LoginController.login);
app.get('/api/auth/verify', LoginController.verifyToken);
app.post('/api/auth/register/teacher', RegisterController.registerTeacher);
app.post('/api/auth/register/student', RegisterController.registerStudent);

// Legacy routes (for backwards compatibility)
app.post('/login', LoginController.login);
app.post('/register/teacher', RegisterController.registerTeacher);
app.post('/register/student', RegisterController.registerStudent);

app.post("/logout", LogoutController.logout);

app.post("/password/forgot", PasswordResetController.requestReset);
app.post("/password/reset", PasswordResetController.resetPassword);

// 404 handler for undefined routes
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
  });
});

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
