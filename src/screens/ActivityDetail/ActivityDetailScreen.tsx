import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  COLORS,
  SPACING,
  RADIUS,
  TYPOGRAPHY,
  CATEGORY_COLORS,
  ELEVATION,
} from '../../constants/theme';
import { INLINE_ACTIVITIES } from '../../constants/activitiesData';
import {
  updateProgress,
  markCompleted,
} from '../../redux/slices/activitySlice';
import type { RootState } from '../../redux/store';
import type { RootStackParamList } from '../../navigation/types';
import type { Activity } from '../../types/activity';
import { progressForActivity } from '../../utils/progress';

// Use INLINE_ACTIVITIES directly — self-contained, never undefined
const ACTIVITIES: Activity[] = INLINE_ACTIVITIES as Activity[];

type Nav = NativeStackNavigationProp<RootStackParamList, 'ActivityDetail'>;
type Route = RouteProp<RootStackParamList, 'ActivityDetail'>;

const ActivityDetailScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const dispatch = useDispatch();
  const { activityId } = route.params;

  const activity = (ACTIVITIES ?? []).find(a => a.id === activityId);
  const progress = useSelector(
    (s: RootState) => s.activity.progress?.[activityId],
  );

  const currentStep = progress?.currentStepIndex ?? 0;
  const status = progress?.status ?? 'NOT_STARTED';
  const pct = activity ? progressForActivity(activity, progress) : 0;

  const cat = activity
    ? CATEGORY_COLORS[activity.category]
    : CATEGORY_COLORS.self;

  const handleStartOrNext = useCallback(() => {
    if (!activity) return;

    if (status === 'NOT_STARTED') {
      dispatch(
        updateProgress({
          activityId,
          updates: { status: 'IN_PROGRESS', currentStepIndex: 0 },
        }),
      );
      return;
    }

    const nextStep = currentStep + 1;
    if (nextStep >= activity.steps.length) {
      dispatch(markCompleted(activityId));
      navigation.navigate('Reflection', { activityId });
    } else {
      dispatch(
        updateProgress({
          activityId,
          updates: { currentStepIndex: nextStep },
        }),
      );
    }
  }, [activity, activityId, currentStep, dispatch, navigation, status]);

  if (!activity) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Icon
            name="alert-circle-outline"
            size={48}
            color={COLORS.textMuted}
          />
          <Text style={styles.notFoundText}>Activity not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = status === 'COMPLETED';
  const isStarted = status === 'IN_PROGRESS';

  const btnLabel = isCompleted
    ? 'Completed ✓'
    : status === 'NOT_STARTED'
    ? 'Start Activity'
    : currentStep + 1 >= activity.steps.length
    ? 'Finish & Reflect'
    : `Next Step (${currentStep + 1}/${activity.steps.length})`;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Back button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Hero image */}
        {activity.imageUrl ? (
          <Image source={{ uri: activity.imageUrl }} style={styles.hero} />
        ) : (
          <View style={[styles.hero, { backgroundColor: cat.soft }]} />
        )}

        {/* Category + time */}
        <View style={styles.metaRow}>
          <View style={[styles.categoryPill, { backgroundColor: cat.soft }]}>
            <Text style={[styles.categoryText, { color: cat.primary }]}>
              {cat.label}
            </Text>
          </View>
          <View style={styles.timeRow}>
            <Icon name="clock-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.timeText}>{activity.estimatedMinutes} min</Text>
          </View>
        </View>

        <Text style={styles.title}>{activity.title}</Text>
        <Text style={styles.desc}>{activity.description}</Text>

        {/* Progress bar */}
        {(isStarted || isCompleted) && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressPct}>{Math.round(pct * 100)}%</Text>
            </View>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${pct * 100}%`, backgroundColor: cat.primary },
                ]}
              />
            </View>
          </View>
        )}

        {/* Steps */}
        <Text style={styles.sectionTitle}>Steps</Text>
        <View style={styles.stepsContainer}>
          {activity.steps.map((step, i) => {
            const done = isCompleted || (isStarted && i < currentStep);
            const active = isStarted && i === currentStep;
            return (
              <View
                key={i}
                style={[
                  styles.stepRow,
                  active && styles.stepRowActive,
                  done && styles.stepRowDone,
                ]}
              >
                <View
                  style={[
                    styles.stepNum,
                    active && { backgroundColor: cat.primary },
                    done && { backgroundColor: COLORS.success },
                  ]}
                >
                  {done ? (
                    <Icon name="check" size={13} color="#fff" />
                  ) : (
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  )}
                </View>
                <Text style={[styles.stepText, done && styles.stepTextDone]}>
                  {step}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Neuroscience tip */}
        <View style={styles.tipBox}>
          <View style={styles.tipHeader}>
            <Icon name="brain" size={16} color={COLORS.accent} />
            <Text style={styles.tipTitle}>Neuroscience Insight</Text>
          </View>
          <Text style={styles.tipText}>{activity.neuroscienceTip}</Text>
        </View>

        {/* CTA */}
        {!isCompleted && (
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: cat.primary }]}
            onPress={handleStartOrNext}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaBtnText}>{btnLabel}</Text>
            <Icon name="arrow-right" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        {isCompleted && (
          <TouchableOpacity
            style={styles.reflectBtn}
            onPress={() => navigation.navigate('Reflection', { activityId })}
            activeOpacity={0.85}
          >
            <Icon name="pencil-outline" size={18} color={COLORS.accent} />
            <Text style={styles.reflectBtnText}>View / Edit Reflection</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: SPACING.lg,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: RADIUS.pill,
    padding: SPACING.sm,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  notFoundText: { ...TYPOGRAPHY.subtitle, color: COLORS.textMuted },
  scroll: { paddingBottom: SPACING.xxxl },
  hero: { width: '100%', height: 240, backgroundColor: COLORS.surfaceMid },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  categoryPill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  categoryText: { fontSize: 12, fontWeight: '600' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  title: {
    ...TYPOGRAPHY.heading1,
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
  },
  desc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  progressSection: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressLabel: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  progressPct: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent,
    fontWeight: '600',
  },
  progressBg: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: RADIUS.pill },
  sectionTitle: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  stepsContainer: {
    marginHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepRowActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentSoft,
  },
  stepRowDone: { opacity: 0.6 },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceMid,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  stepNumText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  stepText: { ...TYPOGRAPHY.body, color: COLORS.textPrimary, flex: 1 },
  stepTextDone: { color: COLORS.textMuted, textDecorationLine: 'line-through' },
  tipBox: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.accent + '33',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tipTitle: { ...TYPOGRAPHY.subtitle, color: COLORS.accent },
  tipText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    ...ELEVATION.card,
  },
  ctaBtnText: { ...TYPOGRAPHY.subtitle, color: '#fff', fontWeight: '700' },
  reflectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    backgroundColor: COLORS.accentSoft,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  reflectBtnText: { ...TYPOGRAPHY.subtitle, color: COLORS.accent },
});

export default ActivityDetailScreen;
