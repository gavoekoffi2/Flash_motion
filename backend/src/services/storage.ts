import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3";
import { env } from "../config/env";
import crypto from "crypto";

export function generateS3Key(projectId: string, filename: string): string {
  const ext = filename.split(".").pop() || "bin";
  const hash = crypto.randomBytes(8).toString("hex");
  return `projects/${projectId}/assets/${hash}.${ext}`;
}

export function generateOutputKey(projectId: string, jobId: string): string {
  return `projects/${projectId}/output/${jobId}.mp4`;
}

export async function uploadToS3(key: string, body: Buffer, contentType: string): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: env.s3Bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: env.s3Bucket, Key: key }),
    { expiresIn },
  );
  // Rewrite internal Docker hostname to publicly accessible endpoint
  if (env.s3PublicEndpoint && env.s3Endpoint !== env.s3PublicEndpoint) {
    return url.replace(env.s3Endpoint, env.s3PublicEndpoint);
  }
  return url;
}

export async function getSignedUploadUrl(key: string, contentType: string, expiresIn = 900): Promise<string> {
  const { PutObjectCommand: Put } = await import("@aws-sdk/client-s3");
  const url = await getSignedUrl(
    s3,
    new Put({ Bucket: env.s3Bucket, Key: key, ContentType: contentType }),
    { expiresIn },
  );
  if (env.s3PublicEndpoint && env.s3Endpoint !== env.s3PublicEndpoint) {
    return url.replace(env.s3Endpoint, env.s3PublicEndpoint);
  }
  return url;
}

export async function deleteFromS3(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({ Bucket: env.s3Bucket, Key: key }),
  );
}
