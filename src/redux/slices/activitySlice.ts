import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ActivityProgress, ActivityStatus } from '../../types/activity';
import { INLINE_ACTIVITIES } from '../../constants/activitiesData';

interface ActivityState {
  activities: typeof INLINE_ACTIVITIES;
  progress: Record<string, ActivityProgress>;
}

const initialState: ActivityState = {
  // Pre-populate with INLINE_ACTIVITIES so activities are NEVER undefined
  activities: INLINE_ACTIVITIES,
  progress: {},
};

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    setActivities(state, action: PayloadAction<typeof INLINE_ACTIVITIES>) {
      state.activities = action.payload ?? INLINE_ACTIVITIES;
    },
    updateProgress(
      state,
      action: PayloadAction<{ activityId: string; updates: Partial<ActivityProgress> }>,
    ) {
      const { activityId, updates } = action.payload;
      const existing = state.progress[activityId] ?? {
        activityId,
        status: 'NOT_STARTED' as ActivityStatus,
        currentStepIndex: 0,
        lastUpdatedAt: new Date().toISOString(),
      };
      state.progress[activityId] = {
        ...existing,
        ...updates,
        lastUpdatedAt: new Date().toISOString(),
      };
    },
    setReflection(
      state,
      action: PayloadAction<{ activityId: string; reflection: string }>,
    ) {
      const { activityId, reflection } = action.payload;
      if (state.progress[activityId]) {
        state.progress[activityId].reflection = reflection;
      }
    },
    markCompleted(state, action: PayloadAction<string>) {
      const activityId = action.payload;
      if (state.progress[activityId]) {
        state.progress[activityId].status = 'COMPLETED';
        state.progress[activityId].completedAt = new Date().toISOString();
      } else {
        // Create progress entry if it doesn't exist yet
        state.progress[activityId] = {
          activityId,
          status: 'COMPLETED',
          currentStepIndex: 0,
          lastUpdatedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        };
      }
    },
    resetProgress(state, action: PayloadAction<string>) {
      delete state.progress[action.payload];
    },
  },
});

export const {
  setActivities,
  updateProgress,
  setReflection,
  markCompleted,
  resetProgress,
} = activitySlice.actions;

export default activitySlice.reducer;
