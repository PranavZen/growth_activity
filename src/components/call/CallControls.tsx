import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

interface Props {
  isMuted: boolean;
  isCameraOff: boolean;
  isSpeakerOn: boolean;
  callType: 'video' | 'audio';
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onSwitchCamera: () => void;
  onToggleSpeaker: () => void;
  onHangUp: () => void;
}

const CallControls: React.FC<Props> = ({
  isMuted, isCameraOff, isSpeakerOn, callType,
  onToggleMute, onToggleCamera, onSwitchCamera, onToggleSpeaker, onHangUp,
}) => (
  <View style={styles.container}>
    <ControlBtn icon={isMuted ? 'microphone-off' : 'microphone'} label={isMuted ? 'Unmute' : 'Mute'} onPress={onToggleMute} active={isMuted} />
    {callType === 'video' && (
      <ControlBtn icon={isCameraOff ? 'video-off' : 'video'} label={isCameraOff ? 'Cam On' : 'Cam Off'} onPress={onToggleCamera} active={isCameraOff} />
    )}
    <ControlBtn icon={isSpeakerOn ? 'volume-high' : 'volume-off'} label="Speaker" onPress={onToggleSpeaker} active={isSpeakerOn} />
    {callType === 'video' && (
      <ControlBtn icon="camera-flip" label="Flip" onPress={onSwitchCamera} active={false} />
    )}
    <ControlBtn icon="phone-hangup" label="End" onPress={onHangUp} danger active={false} />
  </View>
);

const ControlBtn: React.FC<{
  icon: string; label: string; onPress: () => void; active?: boolean; danger?: boolean;
}> = ({ icon, label, onPress, active, danger }) => (
  <TouchableOpacity
    style={[styles.btn, active && styles.btnActive, danger && styles.btnDanger]}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <Icon name={icon} size={24} color={danger ? '#fff' : active ? COLORS.accent : COLORS.textPrimary} />
    <Text style={[styles.label, danger && styles.labelDanger]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    backgroundColor: 'rgba(14,17,23,0.95)',
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surfaceMid,
    gap: 4,
  },
  btnActive: { backgroundColor: 'rgba(92,225,230,0.15)' },
  btnDanger: { backgroundColor: COLORS.danger },
  label: { fontSize: 10, color: COLORS.textSecondary, marginTop: 2 },
  labelDanger: { color: '#fff' },
});

export default CallControls;
