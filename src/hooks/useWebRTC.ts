import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { webRTCService, type CallSession } from '../services/webRTCService';
import {
  signalingService,
  type SignalMessage,
  type RNSessionDescriptionInit,
} from '../services/signalingService';

// NOTE: if manually overriding you can do so by setting process.env.SIGNALING_SERVER
// and using a bundler plugin (React Native does not expose process.env by default).
// Common URL values:
// - iOS Simulator: ws://localhost:8080
// - Android Emulator (default AVD): ws://10.0.2.2:8080
// - Android Emulator (Genymotion): ws://10.0.3.2:8080
// - Physical device on same Wi-Fi: ws://<your-mac-ip>:8080

const SIGNALING_SERVER = (() => {
  const envUrl =
    typeof process !== 'undefined' &&
    process.env &&
    (process.env.SIGNALING_SERVER as string | undefined);

  if (envUrl) return envUrl;

  if (Platform.OS === 'android') {
    return 'ws://10.0.2.2:8080';
  }

  if (Platform.OS === 'ios') {
    return 'ws://localhost:8080';
  }

  return 'ws://192.168.68.106:8080';
})();

export function useWebRTC(userId: string | null) {
  const [session, setSession] = useState<CallSession | null>(null);
  const [isSignalingConnected, setIsSignalingConnected] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{
    from: string;
    offer: RNSessionDescriptionInit;
    callType: 'video' | 'audio';
  } | null>(null);

  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  // Connect to signaling server
  useEffect(() => {
    if (!userId || !SIGNALING_SERVER) return;

    let active = true;

    console.debug('[useWebRTC] signaling server', SIGNALING_SERVER);

    signalingService
      .connect(SIGNALING_SERVER, userId)
      .then(() => {
        if (active) setIsSignalingConnected(true);
      })
      .catch(() => {
        if (active) setIsSignalingConnected(false);
      });

    return () => {
      active = false;
      signalingService.disconnect();
      setIsSignalingConnected(false);
    };
  }, [userId]);

  // Signaling event listeners
  useEffect(() => {
    if (!userId || !SIGNALING_SERVER) return;

    const onIncoming = (msg: SignalMessage) => {
      if (!msg.offer || !msg.from) return;
      const callType = msg.callType ?? 'video';
      webRTCService.setIncomingSession(msg.from, callType);
      setIncomingCall({ from: msg.from, offer: msg.offer, callType });
    };
    const onAnswer = (msg: SignalMessage) => {
      if (msg.answer) webRTCService.handleAnswer(msg.answer);
    };
    const onIce = (msg: SignalMessage) => {
      if (msg.candidate) webRTCService.handleRemoteIce(msg.candidate);
    };
    const onHangup = () => {
      webRTCService.handleHangup();
      setIncomingCall(null);
    };
    const onBusy = () => {
      webRTCService.handleHangup();
    };

    signalingService.on('incoming', onIncoming);
    signalingService.on('answer', onAnswer);
    signalingService.on('ice', onIce);
    signalingService.on('hangup', onHangup);
    signalingService.on('busy', onBusy);

    return () => {
      signalingService.off('incoming', onIncoming);
      signalingService.off('answer', onAnswer);
      signalingService.off('ice', onIce);
      signalingService.off('hangup', onHangup);
      signalingService.off('busy', onBusy);
    };
  }, [userId]);

  // Session change subscription
  useEffect(() => {
    const unsub = webRTCService.onSessionChange(s => {
      setSession({ ...s });
      if (s.state === 'ended' || s.state === 'idle') setIncomingCall(null);
    });
    return () => {
      unsub();
    };
  }, []);

  const startCall = useCallback(
    (remoteUserId: string, callType: 'video' | 'audio' = 'video') => {
      if (!SIGNALING_SERVER) {
        return;
      }
      if (userIdRef.current) {
        webRTCService.startCall(userIdRef.current, remoteUserId, callType);
      }
    },
    [],
  );

  const acceptCall = useCallback(() => {
    if (!userIdRef.current || !incomingCall) return;
    webRTCService.acceptCall(
      userIdRef.current,
      incomingCall.from,
      incomingCall.offer,
      incomingCall.callType,
    );
    setIncomingCall(null);
  }, [incomingCall]);

  const declineCall = useCallback(() => {
    if (!userIdRef.current || !incomingCall) return;
    webRTCService.declineCall(userIdRef.current, incomingCall.from);
    setIncomingCall(null);
  }, [incomingCall]);

  const hangUp = useCallback(() => {
    if (userIdRef.current) webRTCService.hangUp(userIdRef.current);
  }, []);

  const toggleMute = useCallback(() => webRTCService.toggleMute(), []);
  const toggleCamera = useCallback(() => webRTCService.toggleCamera(), []);
  const switchCamera = useCallback(() => webRTCService.switchCamera(), []);

  return {
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
  };
}
