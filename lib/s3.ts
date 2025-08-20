import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Generate a presigned URL for downloading a file from S3
 * @param key - The S3 object key
 * @param expiresIn - The number of seconds until the presigned URL expires
 * @returns A presigned URL for downloading the file
 */
export async function generatePresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw error;
  }
}

/**
 * Generate multiple presigned URLs for downloading files from S3
 * @param keys - Array of S3 object keys
 * @param expiresIn - The number of seconds until the presigned URLs expire
 * @returns An object mapping keys to their presigned URLs
 */
export async function generatePresignedDownloadUrls(
  keys: string[], 
  expiresIn: number = 3600
): Promise<Record<string, string>> {
  const urls: Record<string, string> = {};
  
  await Promise.all(
    keys.map(async (key) => {
      try {
        urls[key] = await generatePresignedDownloadUrl(key, expiresIn);
      } catch (error) {
        console.error(`Error generating URL for ${key}:`, error);
        // Skip this key but continue with others
      }
    })
  );
  
  return urls;
}
