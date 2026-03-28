import { S3Client, CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import { env } from "./env";

export const s3 = new S3Client({
  endpoint: env.s3Endpoint,
  region: env.s3Region,
  credentials: {
    accessKeyId: env.s3AccessKey,
    secretAccessKey: env.s3SecretKey,
  },
  forcePathStyle: true,
});

// Second client using public endpoint — used only for generating signed download URLs
// so that the pre-signed URL points to a publicly reachable address.
export const s3Public = env.s3PublicEndpoint && env.s3PublicEndpoint !== env.s3Endpoint
  ? new S3Client({
      endpoint: env.s3PublicEndpoint,
      region: env.s3Region,
      credentials: {
        accessKeyId: env.s3AccessKey,
        secretAccessKey: env.s3SecretKey,
      },
      forcePathStyle: true,
    })
  : s3;

export async function ensureBucket() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: env.s3Bucket }));
  } catch {
    try {
      await s3.send(new CreateBucketCommand({ Bucket: env.s3Bucket }));
      console.log(`[S3] Created bucket: ${env.s3Bucket}`);
    } catch (err) {
      console.warn("[S3] Could not create bucket (may already exist):", err);
    }
  }
}
