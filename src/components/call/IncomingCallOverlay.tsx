import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

interface Props {
  callerName: string;
  callType: 'video' | 'audio';
  onAccept: () => void;
  onDecline: () => void;
}

const IncomingCallOverlay: React.FC<Props> = ({
  callerName,
  callType,
  onAccept,
  onDecline,
}) => {
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const makeLoop = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1.6,
            duration: 1200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ).start();

    makeLoop(pulse1, 0);
    makeLoop(pulse2, 600);
  }, [pulse1, pulse2]);

  return (
    <View style={styles.overlay}>
      <View style={styles.avatarWrapper}>
        <Animated.View
          style={[styles.ring, { transform: [{ scale: pulse1 }] }]}
        />
        <Animated.View
          style={[
            styles.ring,
            styles.ring2,
            { transform: [{ scale: pulse2 }] },
          ]}
        />
        <View style={styles.avatar}>
          <Text style={styles.initial}>
            {callerName.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.name}>{callerName}</Text>
      <Text style={styles.typeLabel}>
        Incoming {callType === 'video' ? 'Video' : 'Audio'} Call
      </Text>

      <View style={styles.actions}>
        <View style={styles.actionCol}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.decline]}
            onPress={onDecline}
          >
            <Icon name="phone-hangup" size={32} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.actionLabel}>Decline</Text>
        </View>
        <View style={styles.actionCol}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.accept]}
            onPress={onAccept}
          >
            <Icon
              name={callType === 'video' ? 'video' : 'phone'}
              size={32}
              color="#fff"
            />
          </TouchableOpacity>
          <Text style={styles.actionLabel}>Accept</Text>
        </View>
      </View>
    </View>
  );
};

const RING = 100;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  avatarWrapper: {
    width: RING * 2,
    height: RING * 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },
  ring: {
    position: 'absolute',
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    borderWidth: 2,
    borderColor: COLORS.accent,
    opacity: 0.35,
  },
  ring2: { opacity: 0.18 },
  avatar: {
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    backgroundColor: COLORS.accentSoft,
    borderWidth: 2,
    borderColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontSize: 40, fontWeight: '700', color: COLORS.accent },
  name: {
    ...TYPOGRAPHY.heading1,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  typeLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xxxl,
  },
  actions: { flexDirection: 'row', gap: SPACING.xxxl + SPACING.xl },
  actionCol: { alignItems: 'center', gap: SPACING.sm },
  actionBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decline: { backgroundColor: COLORS.danger },
  accept: { backgroundColor: COLORS.success },
  actionLabel: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
});

export default IncomingCallOverlay;
