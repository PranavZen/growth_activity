import type { Activity, ActivityProgress, ActivityStatus } from '../types/activity';

export function statusForActivity(
  activityId: string,
  items: Record<string, ActivityProgress> | undefined,
): ActivityStatus {
  return items?.[activityId]?.status ?? 'NOT_STARTED';
}

export function progressForActivity(activity: Activity, progress?: ActivityProgress): number {
  if (!progress) return 0;
  if (progress.status === 'COMPLETED') return 1;
  const stepCount = Math.max(1, activity.steps.length);
  const idx = Math.min(stepCount, Math.max(0, progress.currentStepIndex));
  return idx / stepCount;
}

