import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, s3Public } from "../config/s3";
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
  // Use s3Public so the pre-signed URL is signed with the public endpoint hostname.
  // This avoids the hostname-replacement approach that broke HMAC signatures.
  return getSignedUrl(
    s3Public,
    new GetObjectCommand({ Bucket: env.s3Bucket, Key: key }),
    { expiresIn },
  );
}

export async function getSignedUploadUrl(key: string, contentType: string, expiresIn = 900): Promise<string> {
  const { PutObjectCommand: Put } = await import("@aws-sdk/client-s3");
  return getSignedUrl(
    s3Public,
    new Put({ Bucket: env.s3Bucket, Key: key, ContentType: contentType }),
    { expiresIn },
  );
}

export async function deleteFromS3(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({ Bucket: env.s3Bucket, Key: key }),
  );
}
