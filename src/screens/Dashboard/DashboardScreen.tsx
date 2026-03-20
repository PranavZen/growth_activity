import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
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
import type { Activity } from '../../types/activity';
const ACTIVITIES: Activity[] = INLINE_ACTIVITIES as Activity[];
import type { RootState } from '../../redux/store';
import type { RootStackParamList } from '../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ActivityCategory } from '../../types/activity';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

const CATEGORIES: ActivityCategory[] = ['relationship', 'self', 'growth'];

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const progress = useSelector((s: RootState) => s.activity.progress);

  const totalActivities = ACTIVITIES.length;
  const completed = Object.values(progress).filter(
    p => p.status === 'COMPLETED',
  ).length;
  const inProgress = Object.values(progress).filter(
    p => p.status === 'IN_PROGRESS',
  ).length;
  const overallPct =
    totalActivities > 0 ? Math.round((completed / totalActivities) * 100) : 0;

  const totalMinutes = Object.entries(progress)
    .filter(([, p]) => p.status === 'COMPLETED')
    .reduce((acc, [id]) => {
      const act = ACTIVITIES.find(a => a.id === id);
      return acc + (act?.estimatedMinutes ?? 0);
    }, 0);

  const categoryStats = CATEGORIES.map(cat => {
    const acts = ACTIVITIES.filter(a => a.category === cat);
    const done = acts.filter(
      a => progress[a.id]?.status === 'COMPLETED',
    ).length;
    return {
      cat,
      total: acts.length,
      done,
      pct: acts.length > 0 ? done / acts.length : 0,
    };
  });

  const recentCompletions = ACTIVITIES.filter(
    a => progress[a.id]?.status === 'COMPLETED',
  )
    .sort((a, b) => {
      const aDate = progress[a.id]?.completedAt ?? '';
      const bDate = progress[b.id]?.completedAt ?? '';
      return bDate.localeCompare(aDate);
    })
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero stat */}
        <View style={styles.heroCard}>
          <View style={styles.ringWrapper}>
            <Text style={styles.ringPct}>{overallPct}%</Text>
            <Text style={styles.ringLabel}>Complete</Text>
          </View>
          <View style={styles.heroStats}>
            <StatItem
              icon="check-circle"
              value={completed}
              label="Completed"
              color={COLORS.success}
            />
            <StatItem
              icon="progress-clock"
              value={inProgress}
              label="In Progress"
              color={COLORS.accent}
            />
            <StatItem
              icon="clock-fast"
              value={totalMinutes}
              label="Minutes"
              color="#F5A623"
            />
          </View>
        </View>

        {/* Category breakdown */}
        <Text style={styles.sectionTitle}>By Category</Text>
        <View style={styles.catGrid}>
          {categoryStats.map(({ cat, total, done, pct }) => {
            const colors = CATEGORY_COLORS[cat];
            return (
              <View
                key={cat}
                style={[styles.catCard, { borderColor: colors.primary + '44' }]}
              >
                <View
                  style={[styles.catIconBg, { backgroundColor: colors.soft }]}
                >
                  <Icon
                    name={
                      cat === 'relationship'
                        ? 'heart'
                        : cat === 'self'
                        ? 'meditation'
                        : 'trending-up'
                    }
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.catLabel}>{colors.label}</Text>
                <Text style={styles.catFrac}>
                  {done}/{total}
                </Text>
                <View style={styles.catBarBg}>
                  <View
                    style={[
                      styles.catBarFill,
                      {
                        width: `${pct * 100}%`,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>

        {/* Recent completions */}
        {recentCompletions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Completions</Text>
            <View style={styles.recentList}>
              {recentCompletions.map(act => {
                const colors = CATEGORY_COLORS[act.category];
                const completedAt = progress[act.id]?.completedAt;
                const dateStr = completedAt
                  ? new Date(completedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : '';
                return (
                  <TouchableOpacity
                    key={act.id}
                    style={styles.recentItem}
                    onPress={() =>
                      navigation.navigate('ActivityDetail', {
                        activityId: act.id,
                      })
                    }
                  >
                    <View
                      style={[
                        styles.recentDot,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recentTitle}>{act.title}</Text>
                      <Text style={styles.recentCat}>{colors.label}</Text>
                    </View>
                    {dateStr ? (
                      <Text style={styles.recentDate}>{dateStr}</Text>
                    ) : null}
                    <Icon
                      name="chevron-right"
                      size={16}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {completed === 0 && (
          <View style={styles.emptyState}>
            <Icon name="sprout" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No completions yet.</Text>
            <Text style={styles.emptySubText}>
              Start an activity to see your progress here.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.emptyBtnText}>Explore Activities</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const StatItem: React.FC<{
  icon: string;
  value: number;
  label: string;
  color: string;
}> = ({ icon, value, label, color }) => (
  <View style={styles.statItem}>
    <Icon name={icon} size={22} color={color} />
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, alignItems: 'flex-start' },
  headerTitle: { ...TYPOGRAPHY.heading2, color: COLORS.textPrimary },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...ELEVATION.card,
  },
  ringWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xl,
  },
  ringPct: { ...TYPOGRAPHY.heading2, color: COLORS.accent },
  ringLabel: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  heroStats: { flex: 1, gap: SPACING.md },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  statValue: { ...TYPOGRAPHY.subtitle, fontWeight: '700', width: 36 },
  statLabel: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  sectionTitle: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  catGrid: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
  catCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  catIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  catLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  catFrac: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  catBarBg: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
  },
  catBarFill: { height: '100%', borderRadius: RADIUS.pill },
  recentList: { gap: SPACING.sm, marginBottom: SPACING.xl },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recentDot: { width: 8, height: 8, borderRadius: 4 },
  recentTitle: { ...TYPOGRAPHY.body, color: COLORS.textPrimary },
  recentCat: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  recentDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginRight: SPACING.xs,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: SPACING.xxxl,
    gap: SPACING.md,
  },
  emptyText: { ...TYPOGRAPHY.subtitle, color: COLORS.textSecondary },
  emptySubText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  emptyBtn: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  emptyBtnText: { ...TYPOGRAPHY.subtitle, color: COLORS.accent },
});

export default DashboardScreen;
