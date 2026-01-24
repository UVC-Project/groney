import { Router, Request, Response } from 'express';
import { getFile } from '../lib/s3';

const router = Router();

// GET /api/files/:key - Serve file from S3/MinIO
router.get('/:key(*)', async (req: Request, res: Response) => {
  try {
    const key = decodeURIComponent(req.params.key);

    const { body, contentType } = await getFile(key);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'private, max-age=31536000'); // Cache for 1 year

    body.pipe(res);
  } catch (error: any) {
    console.error('Error serving file:', error);

    if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'File not found',
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to serve file',
    });
  }
});

export default router;
