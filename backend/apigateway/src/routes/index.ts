import Express, { NextFunction, Request, Response, Router } from 'express';
const router: Router = Express.Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.json('hi');
  next();
});

export default router;
