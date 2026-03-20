import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { useWebRTC } from '../../hooks/useWebRTC';
import IncomingCallOverlay from '../../components/call/IncomingCallOverlay';
import VideoCallScreen from './VideoCallScreen';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Contacts'>;

// ── Replace with real contacts from your backend / Redux ─────────────────
const MOCK_CONTACTS = [
  { id: 'user_alice', name: 'Alice', status: 'online' as const },
  { id: 'user_bob', name: 'Bob', status: 'online' as const },
  { id: 'user_carol', name: 'Carol', status: 'busy' as const },
  { id: 'user_dave', name: 'Dave', status: 'offline' as const },
  { id: 'user_eve', name: 'Eve', status: 'online' as const },
  { id: 'user_frank', name: 'Frank', status: 'online' as const },
];

// ── Replace with your authenticated user id from Redux auth slice ─────────
const MY_USER_ID = 'user_me';

const STATUS_COLOR = {
  online: COLORS.success,
  busy: COLORS.danger,
  offline: COLORS.textMuted,
};

const ContactSeparator: React.FC = () => <View style={styles.sep} />;

const ContactEmptyState: React.FC = () => (
  <View style={styles.empty}>
    <Icon name="account-search" size={40} color={COLORS.textMuted} />
    <Text style={styles.emptyText}>No contacts found</Text>
  </View>
);

const ContactsScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState('');

  const {
    session,
    incomingCall,
    isSignalingConnected,
    startCall,
    acceptCall,
    declineCall,
    hangUp,
    toggleMute,
    toggleCamera,
    switchCamera,
  } = useWebRTC(MY_USER_ID);

  const filtered = MOCK_CONTACTS.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const isActiveCall =
    !!session && session.state !== 'ended' && session.state !== 'idle';

  // Show setup instructions if signaling server is not configured
  const handleCallPress = (contactId: string, callType: 'video' | 'audio') => {
    if (!isSignalingConnected) {
      Alert.alert(
        'Server Not Configured',
        "To make calls, start the signaling server and update SIGNALING_SERVER in src/hooks/useWebRTC.ts.\n\n1. cd server && npm install ws\n2. node signalingServer.js\n3. Set SIGNALING_SERVER = 'ws://YOUR_MAC_IP:8080'",
        [{ text: 'OK' }],
      );
      return;
    }
    startCall(contactId, callType);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Icon name="arrow-left" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Contacts</Text>
        <View style={styles.signalBadge}>
          <Icon
            name={isSignalingConnected ? 'wifi' : 'wifi-off'}
            size={14}
            color={isSignalingConnected ? COLORS.success : COLORS.textMuted}
          />
          <Text
            style={[
              styles.signalText,
              {
                color: isSignalingConnected ? COLORS.success : COLORS.textMuted,
              },
            ]}
          >
            {isSignalingConnected ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      {/* Server not configured banner */}
      {/* {!isSignalingConnected && (
        <View style={styles.banner}>
          <Icon name="information-outline" size={16} color={COLORS.accent} />
          <Text style={styles.bannerText}>
            Start the signaling server to enable calls. See{' '}
            <Text style={styles.bannerCode}>server/signalingServer.js</Text>
          </Text>
        </View>
      )} */}

      {/* Search */}
      <View style={styles.searchRow}>
        <Icon name="magnify" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts…"
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon name="close-circle" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.onlineCount}>
        {MOCK_CONTACTS.filter(c => c.status === 'online').length} online
      </Text>

      {/* Contact list */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Avatar */}
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{item.name.charAt(0)}</Text>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: STATUS_COLOR[item.status] },
                ]}
              />
            </View>

            {/* Info */}
            <View style={styles.info}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text
                style={[
                  styles.contactStatus,
                  { color: STATUS_COLOR[item.status] },
                ]}
              >
                {item.status}
              </Text>
            </View>

            {/* Call buttons */}
            <View style={styles.callBtns}>
              <CallBtn
                icon="phone"
                color={COLORS.success}
                disabled={item.status === 'offline'}
                onPress={() => handleCallPress(item.id, 'audio')}
              />
              <CallBtn
                icon="video"
                color={COLORS.accent}
                disabled={item.status === 'offline'}
                onPress={() => handleCallPress(item.id, 'video')}
              />
            </View>
          </View>
        )}
        ItemSeparatorComponent={ContactSeparator}
        ListEmptyComponent={ContactEmptyState}
      />

      {/* Incoming call overlay */}
      {incomingCall && !isActiveCall && (
        <IncomingCallOverlay
          callerName={incomingCall.from}
          callType={incomingCall.callType}
          onAccept={acceptCall}
          onDecline={declineCall}
        />
      )}

      {/* Active call modal */}
      <Modal
        visible={isActiveCall}
        animationType="slide"
        statusBarTranslucent
        presentationStyle="fullScreen"
      >
        {session && isActiveCall && (
          <VideoCallScreen
            session={session}
            onHangUp={hangUp}
            onToggleMute={toggleMute}
            onToggleCamera={toggleCamera}
            onSwitchCamera={switchCamera}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
};

const CallBtn: React.FC<{
  icon: string;
  color: string;
  disabled: boolean;
  onPress: () => void;
}> = ({ icon, color, disabled, onPress }) => (
  <TouchableOpacity
    style={[styles.callBtn, { borderColor: disabled ? COLORS.border : color }]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.75}
  >
    <Icon name={icon} size={18} color={disabled ? COLORS.textMuted : color} />
  </TouchableOpacity>
);

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
  backBtn: { width: 40, alignItems: 'flex-start' },
  title: { ...TYPOGRAPHY.heading2, color: COLORS.textPrimary, flex: 1 },
  signalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  signalText: { fontSize: 11 },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    margin: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.accentSoft,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.accent + '55',
  },
  bannerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  bannerCode: { color: COLORS.accent, fontFamily: 'monospace' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    backgroundColor: COLORS.surfaceSoft,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 14 },
  onlineCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxxl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarInitial: { fontSize: 20, fontWeight: '700', color: COLORS.accent },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLORS.background,
  },
  info: { flex: 1 },
  contactName: { ...TYPOGRAPHY.subtitle, color: COLORS.textPrimary },
  contactStatus: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  callBtns: { flexDirection: 'row', gap: SPACING.sm },
  callBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sep: { height: 1, backgroundColor: COLORS.borderSoft },
  empty: { alignItems: 'center', paddingTop: SPACING.xxxl, gap: SPACING.md },
  emptyText: { ...TYPOGRAPHY.body, color: COLORS.textMuted },
});

export default ContactsScreen;
