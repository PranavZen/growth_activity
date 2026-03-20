export type ActivityCategory = 'relationship' | 'self' | 'growth';

export type ActivityStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';

export interface Activity {
  id: string;
  title: string;
  description: string;
  steps: string[];
  neuroscienceTip: string;
  category: ActivityCategory;
  estimatedMinutes?: number;
  imageUrl?: string;
}

export interface ActivityProgress {
  activityId: string;
  status: ActivityStatus;
  currentStepIndex: number;
  lastUpdatedAt: string;
  reflection?: string;
  completedAt?: string;
}

