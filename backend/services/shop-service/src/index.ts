import express from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', routes);

const PORT = process.env.PORT || 4001; // use 4001 so it doesn't clash with others
app.listen(PORT, () => {
    console.log(`Shop service running on http://localhost:${PORT}`);
});
