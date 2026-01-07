import { S3Client, PutObjectCommand, CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand } from '@aws-sdk/client-s3';

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

// Public read policy for the bucket
const publicReadPolicy = {
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'PublicRead',
      Effect: 'Allow',
      Principal: '*',
      Action: ['s3:GetObject'],
      Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
    },
  ],
};

// Set bucket policy for public read access
async function setBucketPublicPolicy(): Promise<void> {
  try {
    await s3Client.send(
      new PutBucketPolicyCommand({
        Bucket: BUCKET_NAME,
        Policy: JSON.stringify(publicReadPolicy),
      })
    );
    console.log(`✅ Public read policy set for bucket "${BUCKET_NAME}"`);
  } catch (error) {
    console.error('❌ Error setting bucket policy:', error);
    throw error;
  }
}

// Ensure bucket exists on startup
export async function ensureBucketExists(): Promise<void> {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
    console.log(`✅ Bucket "${BUCKET_NAME}" exists`);
    // Always ensure policy is set (in case it was reset)
    await setBucketPublicPolicy();
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      console.log(`📦 Creating bucket "${BUCKET_NAME}"...`);
      await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
      console.log(`✅ Bucket "${BUCKET_NAME}" created`);
      // Set public read policy on new bucket
      await setBucketPublicPolicy();
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
      ACL: 'public-read', // Make files publicly accessible
    })
  );

  // Return the public URL
  const endpoint = process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT || 'http://localhost:9000';
  return `${endpoint}/${BUCKET_NAME}/${key}`;
}

export { s3Client, BUCKET_NAME };
