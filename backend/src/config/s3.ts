import { S3Client, CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import { env } from "./env";

export let s3Available = false;

export const s3 = new S3Client({
  endpoint: env.s3Endpoint,
  region: env.s3Region,
  credentials: {
    accessKeyId: env.s3AccessKey,
    secretAccessKey: env.s3SecretKey,
  },
  forcePathStyle: true,
});

export async function ensureBucket() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: env.s3Bucket }));
    s3Available = true;
  } catch {
    try {
      await s3.send(new CreateBucketCommand({ Bucket: env.s3Bucket }));
      s3Available = true;
      console.log(`[S3] Created bucket: ${env.s3Bucket}`);
    } catch (err) {
      s3Available = false;
      console.warn("[S3] Storage unavailable — asset uploads will be disabled until S3/MinIO is running at", env.s3Endpoint);
    }
  }
}
