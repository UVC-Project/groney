import { S3Client, PutObjectCommand, GetObjectCommand, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const BUCKET_NAME = 'groney-submissions';

// MinIO/S3 client configuration
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT || 'http://minio:9000',
  region: 'us-east-1', // MinIO doesn't care about region, but SDK requires it
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: true, // Required for MinIO
});

// Ensure bucket exists on startup
export async function ensureBucketExists(): Promise<void> {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    console.log(`✅ Bucket "${BUCKET_NAME}" exists`);
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      console.log(`📦 Creating bucket "${BUCKET_NAME}"...`);
      await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
      console.log(`✅ Bucket "${BUCKET_NAME}" created`);
    } else {
      console.error('❌ Error checking bucket:', error);
      throw error;
    }
  }
}

// Upload file to S3/MinIO
export async function uploadFile(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  // Return the API proxy URL (not direct MinIO URL)
  // Images will be served through /api/files/:key
  return `/api/files/${encodeURIComponent(key)}`;
}

// Get file from S3/MinIO
export async function getFile(key: string): Promise<{ body: Readable; contentType: string }> {
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );

  return {
    body: response.Body as Readable,
    contentType: response.ContentType || 'application/octet-stream',
  };
}

export { s3Client, BUCKET_NAME };
