import express from 'express';
import { config } from 'dotenv';

config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mascot-engine' });
});

app.listen(PORT, () => {
  console.log(`Mascot Engine running on port ${PORT}`);
});
