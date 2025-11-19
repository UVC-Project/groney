import express from 'express';
import { config } from 'dotenv';

config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mission-service' });
});

app.listen(PORT, () => {
  console.log(`Mission Service running on port ${PORT}`);
});
