import { S3Client, CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand } from "@aws-sdk/client-s3";
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

async function setBucketPrivatePolicy() {
  try {
    const policy = JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "DenyPublicAccess",
          Effect: "Deny",
          Principal: "*",
          Action: "s3:GetObject",
          Resource: `arn:aws:s3:::${env.s3Bucket}/*`,
          Condition: {
            StringNotEquals: {
              "aws:PrincipalAccount": "owner",
            },
          },
        },
      ],
    });
    await s3.send(new PutBucketPolicyCommand({ Bucket: env.s3Bucket, Policy: policy }));
    console.log("[S3] Bucket policy set to private");
  } catch (err) {
    // Some S3-compatible stores (MinIO) may not support bucket policies — warn but continue
    console.warn("[S3] Could not set bucket policy (non-critical):", (err as Error).message);
  }
}

export async function ensureBucket() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: env.s3Bucket }));
    s3Available = true;
  } catch {
    try {
      await s3.send(new CreateBucketCommand({ Bucket: env.s3Bucket }));
      s3Available = true;
      console.log(`[S3] Created bucket: ${env.s3Bucket}`);
      await setBucketPrivatePolicy();
    } catch (err) {
      s3Available = false;
      console.warn("[S3] Storage unavailable — asset uploads will be disabled until S3/MinIO is running at", env.s3Endpoint);
    }
  }
}
