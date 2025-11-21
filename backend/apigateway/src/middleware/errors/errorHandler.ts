import { Request, Response } from 'express';
import * as Dotenv from 'dotenv';
Dotenv.config({ path: '.env' });

/**
 * Middleware to handle errors
 * @param err - ErrorResponse object
 * @param req - Request object
 * @param res - Response object
 */
export function errorHandler(err: Error, req: Request, res: Response, next: Function): void {
  const errStatus: number = typeof err.cause === 'number' ? err.cause : 500;
  const errMsg: string = err.message || 'Something went wrong';
  res.status(errStatus).json({
    success: false,
    status: errStatus,
    message: errMsg,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {},
  });
}
