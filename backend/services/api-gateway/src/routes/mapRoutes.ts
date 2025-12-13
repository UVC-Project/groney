import { Router } from 'express';

const router = Router();

const MISSION_SERVICE_URL =
  process.env.MISSION_SERVICE_URL ||
  `http://localhost:${process.env.MISSION_SERVICE_PORT || 3003}`;

// PUBLIC: GET /map/missions
  router.get('/missions', async (_req, res) => {
  try {
    const response = await fetch(`${MISSION_SERVICE_URL}/map/missions`);
    const text = await response.text();

    res
      .status(response.status)
      .type('application/json')
      .send(text);
  } catch (err) {
    console.error('Gateway /map/missions error:', err);
    res.status(502).json({ message: 'Mission service unavailable' });
  }
});

// PROTECTED: POST /missions/:id/accept
router.post('/missions/:id/accept', async (req, res) => {
  const missionId = req.params.id;
  try {
    const response = await fetch(`${MISSION_SERVICE_URL}/map/missions/${missionId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    const text = await response.text();
    res
      .status(response.status)
      .type('application/json')
      .send(text);
  } catch (err) {
    console.error('Gateway /missions/:id/accept error:', err);
    res.status(502).json({ message: 'Mission service unavailable' });
  }
});

export default router;
