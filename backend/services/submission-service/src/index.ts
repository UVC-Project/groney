import express from 'express';
import { config } from 'dotenv';

config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'submission-service' });
});

app.listen(PORT, () => {
  console.log(`Submission Service running on port ${PORT}`);
});
