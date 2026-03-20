import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import type { CallSession } from '../../services/webRTCService';
import CallControls from '../../components/call/CallControls';
import CallTimer from '../../components/call/CallTimer';

interface Props {
  session: CallSession;
  onHangUp: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onSwitchCamera: () => void;
}

const STATE_LABEL: Record<string, string> = {
  calling: 'Calling…',
  connecting: 'Connecting…',
  reconnecting: 'Reconnecting…',
  connected: '',
};

const VideoCallScreen: React.FC<Props> = ({
  session, onHangUp, onToggleMute, onToggleCamera, onSwitchCamera,
}) => {
  const [isSpeakerOn, setIsSpeakerOn] = useState(session.callType === 'video');
  const [controlsVisible, setControlsVisible] = useState(true);

  const toggleSpeaker = useCallback(() => setIsSpeakerOn(v => !v), []);
  const toggleControls = useCallback(() => setControlsVisible(v => !v), []);
  const isVideo = session.callType === 'video';

  return (
    <View style={styles.root}>
      <StatusBar hidden />

      {/* Remote stream / Audio avatar */}
      {isVideo && session.remoteStream ? (
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={toggleControls}>
          <RTCView
            streamURL={session.remoteStream.toURL()}
            style={StyleSheet.absoluteFill}
            objectFit="cover"
            mirror={false}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[StyleSheet.absoluteFill, styles.audioBg]}
          activeOpacity={1}
          onPress={toggleControls}
        >
          <View style={styles.remoteAvatar}>
            <Text style={styles.remoteInitial}>
              {session.remoteUserId.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.remoteNameAudio}>{session.remoteUserId}</Text>
        </TouchableOpacity>
      )}

      {/* Top HUD */}
      {controlsVisible && (
        <SafeAreaView style={styles.topHud} edges={['top']}>
          <View style={styles.topRow}>
            <View>
              <Text style={styles.remoteName}>{session.remoteUserId}</Text>
              {STATE_LABEL[session.state] ? (
                <Text style={styles.stateText}>{STATE_LABEL[session.state]}</Text>
              ) : (
                <CallTimer startedAt={session.startedAt} />
              )}
            </View>
            <View style={styles.encBadge}>
              <Icon name="shield-check" size={12} color={COLORS.success} />
              <Text style={styles.encText}>E2E Encrypted</Text>
            </View>
          </View>
        </SafeAreaView>
      )}

      {/* Local PiP preview */}
      {isVideo && session.localStream && !session.isCameraOff && (
        <View style={styles.localPip}>
          <RTCView
            streamURL={session.localStream.toURL()}
            style={StyleSheet.absoluteFill}
            objectFit="cover"
            mirror
            zOrder={1}
          />
        </View>
      )}

      {/* Controls */}
      {controlsVisible && (
        <View style={styles.controlsWrapper}>
          <CallControls
            isMuted={session.isMuted}
            isCameraOff={session.isCameraOff}
            isSpeakerOn={isSpeakerOn}
            callType={session.callType}
            onToggleMute={onToggleMute}
            onToggleCamera={onToggleCamera}
            onSwitchCamera={onSwitchCamera}
            onToggleSpeaker={toggleSpeaker}
            onHangUp={onHangUp}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  audioBg: { backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  remoteAvatar: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: COLORS.accentSoft,
    borderWidth: 2, borderColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  remoteInitial: { fontSize: 52, fontWeight: '700', color: COLORS.accent },
  remoteNameAudio: { ...TYPOGRAPHY.heading2, color: COLORS.textPrimary, marginTop: SPACING.md },
  topHud: { position: 'absolute', top: 0, left: 0, right: 0 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  remoteName: { ...TYPOGRAPHY.heading2, color: COLORS.textPrimary },
  stateText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  encBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(74,222,128,0.12)',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  encText: { fontSize: 10, color: COLORS.success },
  localPip: {
    position: 'absolute',
    top: 100, right: SPACING.lg,
    width: 100, height: 140,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: '#000',
    zIndex: 10,
  },
  controlsWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});

export default VideoCallScreen;
