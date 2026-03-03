import { prisma } from "../config/prisma";

/**
 * Check and auto-reset daily quotas.
 * If lastResetAt is from a previous day, reset counters to 0.
 */
export async function checkAndResetQuota(userId: string) {
  const quota = await prisma.quota.findUnique({ where: { userId } });
  if (!quota) return null;

  const now = new Date();
  const lastReset = new Date(quota.lastResetAt);

  // Reset if last reset was on a different day
  if (
    lastReset.getUTCFullYear() !== now.getUTCFullYear() ||
    lastReset.getUTCMonth() !== now.getUTCMonth() ||
    lastReset.getUTCDate() !== now.getUTCDate()
  ) {
    return prisma.quota.update({
      where: { userId },
      data: {
        llmCallsToday: 0,
        rendersToday: 0,
        lastResetAt: now,
      },
    });
  }

  return quota;
}
