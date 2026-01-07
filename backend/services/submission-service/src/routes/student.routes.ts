import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import { uploadFile } from '../lib/s3';

const router = Router();
const prisma = new PrismaClient();

// Configure Multer for memory storage (we'll upload to S3)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    // Accept only images
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
});

// Middleware to verify student authentication
const requireStudent = (req: Request, res: Response, next: Function) => {
  const userId = req.headers['x-user-id'] as string;
  const userRole = req.headers['x-user-role'] as string;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User ID required' });
  }

  // Allow both students and teachers to access student routes
  if (userRole !== 'STUDENT' && userRole !== 'TEACHER') {
    return res.status(403).json({ error: 'Forbidden', message: 'Access denied' });
  }

  (req as any).userId = userId;
  (req as any).userRole = userRole;
  next();
};

// POST /api/student/submissions/:submissionId/upload - Upload photo for a submission
router.post(
  '/submissions/:submissionId/upload',
  requireStudent,
  upload.single('photo'),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { submissionId } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'No photo file provided',
        });
      }

      // Find the submission and verify ownership
      const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
        include: {
          mission: {
            select: { title: true },
          },
        },
      });

      if (!submission) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Submission not found',
        });
      }

      // Verify the submission belongs to this user
      if (submission.userId !== userId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only upload photos for your own submissions',
        });
      }

      // Verify submission is still pending
      if (submission.status !== 'PENDING') {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'This submission has already been reviewed',
        });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = file.mimetype.split('/')[1];
      const key = `submissions/${submission.classId}/${submissionId}-${timestamp}.${extension}`;

      // Upload to S3/MinIO
      const photoUrl = await uploadFile(key, file.buffer, file.mimetype);

      // Update submission with photo URL
      const updatedSubmission = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          photoUrl,
          updatedAt: new Date(),
        },
      });

      res.json({
        message: 'Photo uploaded successfully! Your submission is now pending review.',
        submission: {
          id: updatedSubmission.id,
          photoUrl: updatedSubmission.photoUrl,
          status: updatedSubmission.status,
        },
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      
      // Handle Multer errors
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'File too large. Maximum size is 5MB.',
          });
        }
      }
      
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to upload photo',
      });
    }
  }
);

// GET /api/student/submissions/:submissionId - Get submission details
router.get('/submissions/:submissionId', requireStudent, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { submissionId } = req.params;

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        mission: {
          select: {
            id: true,
            title: true,
            description: true,
            xpReward: true,
            coinReward: true,
            thirstBoost: true,
            hungerBoost: true,
            happinessBoost: true,
            cleanlinessBoost: true,
          },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Submission not found',
      });
    }

    // Verify the submission belongs to this user
    if (submission.userId !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only view your own submissions',
      });
    }

    res.json({
      id: submission.id,
      missionId: submission.missionId,
      mission: submission.mission,
      photoUrl: submission.photoUrl,
      status: submission.status.toLowerCase(),
      createdAt: submission.createdAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch submission',
    });
  }
});

export default router;
