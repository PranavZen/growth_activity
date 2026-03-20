import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
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
} from '../../constants/theme';
import { INLINE_ACTIVITIES } from '../../constants/activitiesData';
import { setReflection } from '../../redux/slices/activitySlice';
import type { RootState } from '../../redux/store';
import type { RootStackParamList } from '../../navigation/types';
import type { Activity } from '../../types/activity';

// Use INLINE_ACTIVITIES directly — never undefined
const ACTIVITIES: Activity[] = INLINE_ACTIVITIES as Activity[];

type Nav = NativeStackNavigationProp<RootStackParamList, 'Reflection'>;
type Route = RouteProp<RootStackParamList, 'Reflection'>;

const PROMPTS = [
  'What did you notice about yourself during this activity?',
  'What was the most challenging part?',
  'What insight will you carry forward?',
  'How did this shift your perspective?',
];

const ReflectionScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const dispatch = useDispatch();
  const { activityId } = route.params;

  const activity = (ACTIVITIES ?? []).find(a => a.id === activityId);
  const savedReflection = useSelector(
    (s: RootState) => s.activity.progress?.[activityId]?.reflection ?? '',
  );

  const [text, setText] = useState(savedReflection);
  const [saved, setSaved] = useState(false);

  const cat = activity
    ? CATEGORY_COLORS[activity.category]
    : CATEGORY_COLORS.self;

  const handleSave = useCallback(() => {
    dispatch(setReflection({ activityId, reflection: text }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [activityId, dispatch, text]);

  const handleDone = useCallback(() => {
    dispatch(setReflection({ activityId, reflection: text }));
    navigation.navigate('Home');
  }, [activityId, dispatch, navigation, text]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Reflect</Text>
            <Text style={styles.headerSub}>{activity?.title ?? ''}</Text>
          </View>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={[styles.saveBtnText, saved && styles.saveBtnSaved]}>
              {saved ? 'Saved ✓' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* Completion celebration */}
          <View
            style={[
              styles.celebCard,
              { borderColor: cat.primary + '55', backgroundColor: cat.soft },
            ]}
          >
            <Icon name="check-decagram" size={32} color={cat.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.celebTitle, { color: cat.primary }]}>
                Activity Complete!
              </Text>
              <Text style={styles.celebSub}>
                Take a moment to reflect on your experience.
              </Text>
            </View>
          </View>

          {/* Prompts */}
          <Text style={styles.sectionLabel}>Reflection Prompts</Text>
          <View style={styles.promptsRow}>
            {PROMPTS.map((p, i) => (
              <TouchableOpacity
                key={i}
                style={styles.promptChip}
                onPress={() =>
                  setText(prev => (prev ? `${prev}\n\n${p}\n` : `${p}\n`))
                }
              >
                <Text style={styles.promptText}>{p}</Text>
                <Icon name="plus" size={14} color={COLORS.accent} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Text input */}
          <Text style={styles.sectionLabel}>Your Reflection</Text>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Write your thoughts here…"
            placeholderTextColor={COLORS.textMuted}
            value={text}
            onChangeText={setText}
            textAlignVertical="top"
            autoCorrect
          />

          <Text style={styles.charCount}>{text.length} characters</Text>

          {/* Done button */}
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: cat.primary }]}
            onPress={handleDone}
            activeOpacity={0.85}
          >
            <Icon name="home-outline" size={20} color="#fff" />
            <Text style={styles.doneBtnText}>Save & Return Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: SPACING.xs },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  headerSub: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  saveBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  saveBtnText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent,
    fontWeight: '600',
  },
  saveBtnSaved: { color: COLORS.success },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxxl },
  celebCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.xl,
  },
  celebTitle: { ...TYPOGRAPHY.subtitle, fontWeight: '700' },
  celebSub: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: 2 },
  sectionLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  promptsRow: { gap: SPACING.sm, marginBottom: SPACING.xl },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  promptText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.body,
    minHeight: 200,
    marginBottom: SPACING.xs,
  },
  charCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginBottom: SPACING.xl,
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  doneBtnText: { ...TYPOGRAPHY.subtitle, color: '#fff', fontWeight: '700' },
});

export default ReflectionScreen;
