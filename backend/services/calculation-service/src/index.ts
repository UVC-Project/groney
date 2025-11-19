import express from 'express';
import { config } from 'dotenv';

config();

const app = express();
const PORT = process.env.PORT || 3006;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'calculation-service' });
});

app.listen(PORT, () => {
  console.log(`Calculation Service running on port ${PORT}`);
});
