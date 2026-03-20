import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
import type { Activity, ActivityCategory } from '../../types/activity';
import type { RootStackParamList } from '../../navigation/types';
import type { RootState } from '../../redux/store';
import { statusForActivity, progressForActivity } from '../../utils/progress';

// Use INLINE_ACTIVITIES directly to avoid undefined during Metro cold-start
const ACTIVITIES: Activity[] = INLINE_ACTIVITIES as Activity[];

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const CATEGORY_TABS: { key: ActivityCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'relationship', label: 'Relationship' },
  { key: 'self', label: 'Self' },
  { key: 'growth', label: 'Growth' },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  // ✅ rawProgress is the stable selector value
  const rawProgress = useSelector((s: RootState) => s.activity.progress);

  // ✅ useMemo only recomputes when rawProgress actually changes
  const progress = useMemo(() => rawProgress ?? {}, [rawProgress]);
  const [activeTab, setActiveTab] = React.useState<ActivityCategory | 'all'>(
    'all',
  );

  const safeActivities = ACTIVITIES ?? [];
  const filtered =
    activeTab === 'all'
      ? safeActivities
      : safeActivities.filter(a => a.category === activeTab);

  const completed = Object.values(progress).filter(
    p => p.status === 'COMPLETED',
  ).length;
  const total = safeActivities.length;

  const renderItem = useCallback(
    ({ item }: { item: Activity }) => {
      const status = statusForActivity(item.id, progress);
      const pct = progressForActivity(item, progress[item.id]);
      const cat = CATEGORY_COLORS[item.category];

      return (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate('ActivityDetail', { activityId: item.id })
          }
        >
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
          ) : (
            <View style={[styles.cardImage, { backgroundColor: cat.soft }]} />
          )}

          <View style={[styles.categoryPill, { backgroundColor: cat.soft }]}>
            <Text style={[styles.categoryText, { color: cat.primary }]}>
              {cat.label}
            </Text>
          </View>

          {status === 'COMPLETED' && (
            <View style={styles.completedBadge}>
              <Icon name="check-circle" size={18} color={COLORS.success} />
            </View>
          )}

          <View style={styles.cardBody}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.cardDesc} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.cardFooter}>
              <View style={styles.minuteRow}>
                <Icon name="clock-outline" size={13} color={COLORS.textMuted} />
                <Text style={styles.minuteText}>
                  {item.estimatedMinutes} min
                </Text>
              </View>
              {pct > 0 && pct < 1 && (
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${pct * 100}%`, backgroundColor: cat.primary },
                    ]}
                  />
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation, progress],
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello 👋</Text>
          <Text style={styles.subtitle}>What will you work on today?</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Contacts')}
          >
            <Icon name="phone" size={22} color={COLORS.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Icon name="chart-bar" size={22} color={COLORS.accent} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{total}</Text>
          <Text style={styles.statLabel}>Activities</Text>
        </View>
        <View style={[styles.statCard, styles.statCardMid]}>
          <Text style={styles.statValue}>{completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {total > 0 ? Math.round((completed / total) * 100) : 0}%
          </Text>
          <Text style={styles.statLabel}>Progress</Text>
        </View>
      </View>

      <View style={styles.tabsRow}>
        {CATEGORY_TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  greeting: { ...TYPOGRAPHY.heading1, color: COLORS.textPrimary },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: SPACING.sm },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md },
  statCardMid: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: { ...TYPOGRAPHY.heading2, color: COLORS.accent },
  statLabel: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginTop: 2 },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabActive: { backgroundColor: COLORS.accentSoft, borderColor: COLORS.accent },
  tabText: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  tabTextActive: { color: COLORS.accent, fontWeight: '600' },
  list: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...ELEVATION.card,
  },
  cardImage: { width: '100%', height: 160, backgroundColor: COLORS.surfaceMid },
  categoryPill: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  categoryText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  completedBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.successSoft,
    borderRadius: RADIUS.pill,
    padding: 3,
  },
  cardBody: { padding: SPACING.md },
  cardTitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  cardDesc: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  minuteRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  minuteText: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.pill,
    marginLeft: SPACING.sm,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: RADIUS.pill },
});

export default HomeScreen;
