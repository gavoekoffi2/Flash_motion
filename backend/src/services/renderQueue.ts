import { Queue } from "bullmq";
import { getRedisOpts } from "../config/redis";

export const renderQueue = new Queue("render", {
  connection: getRedisOpts(),
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export interface RenderJobData {
  jobId: string;
  projectId: string;
  storyboard: object;
  assets: { id: string; type: string; s3Key: string; url?: string }[];
  outputKey: string;
}

export async function enqueueRender(data: RenderJobData): Promise<string> {
  const job = await renderQueue.add("render-video", data, {
    jobId: data.jobId,
  });
  return job.id!;
}
