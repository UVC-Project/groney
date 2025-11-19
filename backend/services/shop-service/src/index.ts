import express from 'express';
import { config } from 'dotenv';

config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'shop-service' });
});

app.listen(PORT, () => {
  console.log(`Shop Service running on port ${PORT}`);
});
