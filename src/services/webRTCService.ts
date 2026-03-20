/**
 * webRTCService.ts
 * Manages RTCPeerConnection using react-native-webrtc (free, open-source).
 */

import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
  MediaStream,
} from 'react-native-webrtc';

import {
  signalingService,
  type RNSessionDescriptionInit,
  type RNIceCandidateInit,
} from './signalingService';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
];

export type CallState =
  | 'idle'
  | 'calling'
  | 'incoming'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'ended';

export interface CallSession {
  remoteUserId: string;
  callType: 'video' | 'audio';
  isInitiator: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  state: CallState;
  startedAt?: Date;
  isMuted: boolean;
  isCameraOff: boolean;
  isSpeakerOn: boolean;
}

type SessionHandler = (s: CallSession) => void;

// Safely convert createOffer/createAnswer output → RNSessionDescriptionInit
function toRNSdp(desc: any): RNSessionDescriptionInit | null {
  if (!desc || typeof desc.sdp !== 'string' || !desc.sdp) return null;
  return {
    type: desc.type as 'offer' | 'answer' | 'pranswer' | 'rollback',
    sdp: desc.sdp,
  };
}

class WebRTCService {
  private pc: RTCPeerConnection | null = null;
  private session: CallSession | null = null;
  private pendingCandidates: RNIceCandidateInit[] = [];
  private handlers = new Set<SessionHandler>();

  onSessionChange(fn: SessionHandler) {
    this.handlers.add(fn);
    return () => {
      this.handlers.delete(fn);
    };
  }

  getSession() {
    return this.session;
  }

  async startCall(
    localUserId: string,
    remoteUserId: string,
    callType: 'video' | 'audio',
  ) {
    await this.cleanup();
    const localStream = await this.getMedia(callType);
    this.createPC(localStream);

    this.session = {
      remoteUserId,
      callType,
      isInitiator: true,
      localStream,
      remoteStream: null,
      state: 'calling',
      isMuted: false,
      isCameraOff: false,
      isSpeakerOn: callType === 'video',
    };
    this.emit();

    const rawOffer = await this.pc!.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: callType === 'video',
    } as any);

    await this.pc!.setLocalDescription(
      new RTCSessionDescription(rawOffer as any),
    );

    const offer = toRNSdp(rawOffer);
    if (!offer) return;

    signalingService.send({
      type: 'call',
      from: localUserId,
      to: remoteUserId,
      offer,
      callType,
    });
  }

  async acceptCall(
    localUserId: string,
    remoteUserId: string,
    offer: RNSessionDescriptionInit,
    callType: 'video' | 'audio',
  ) {
    const localStream = await this.getMedia(callType);
    this.createPC(localStream);

    this.session = {
      remoteUserId,
      callType,
      isInitiator: false,
      localStream,
      remoteStream: null,
      state: 'connecting',
      isMuted: false,
      isCameraOff: false,
      isSpeakerOn: callType === 'video',
    };
    this.emit();

    await this.pc!.setRemoteDescription(
      new RTCSessionDescription(offer as any),
    );

    for (const c of this.pendingCandidates) {
      await this.pc!.addIceCandidate(new RTCIceCandidate(c as any));
    }
    this.pendingCandidates = [];

    const rawAnswer = await this.pc!.createAnswer();
    await this.pc!.setLocalDescription(
      new RTCSessionDescription(rawAnswer as any),
    );

    const answer = toRNSdp(rawAnswer);
    if (!answer) return;

    signalingService.send({
      type: 'answer',
      from: localUserId,
      to: remoteUserId,
      answer,
    });
  }

  declineCall(localUserId: string, remoteUserId: string) {
    signalingService.send({
      type: 'busy',
      from: localUserId,
      to: remoteUserId,
    });
    this.cleanup();
  }

  hangUp(localUserId: string) {
    if (this.session) {
      signalingService.send({
        type: 'hangup',
        from: localUserId,
        to: this.session.remoteUserId,
      });
    }
    this.cleanup();
  }

  toggleMute() {
    const track = this.session?.localStream?.getAudioTracks()[0];
    if (track && this.session) {
      track.enabled = !track.enabled;
      this.session.isMuted = !track.enabled;
      this.emit();
      return this.session.isMuted;
    }
    return false;
  }

  toggleCamera() {
    const track = this.session?.localStream?.getVideoTracks()[0];
    if (track && this.session) {
      track.enabled = !track.enabled;
      this.session.isCameraOff = !track.enabled;
      this.emit();
      return this.session.isCameraOff;
    }
    return false;
  }

  async switchCamera() {
    const track = this.session?.localStream?.getVideoTracks()[0] as any;
    track?._switchCamera?.();
  }

  async handleAnswer(answer: RNSessionDescriptionInit) {
    await this.pc?.setRemoteDescription(
      new RTCSessionDescription(answer as any),
    );
    for (const c of this.pendingCandidates) {
      await this.pc!.addIceCandidate(new RTCIceCandidate(c as any));
    }
    this.pendingCandidates = [];
    if (this.session) {
      this.session.state = 'connected';
      this.session.startedAt = new Date();
      this.emit();
    }
  }

  async handleRemoteIce(candidate: RNIceCandidateInit) {
    if (this.pc?.remoteDescription) {
      await this.pc.addIceCandidate(new RTCIceCandidate(candidate as any));
    } else {
      this.pendingCandidates.push(candidate);
    }
  }

  handleHangup() {
    this.cleanup('ended');
  }

  setIncomingSession(remoteUserId: string, callType: 'video' | 'audio') {
    this.session = {
      remoteUserId,
      callType,
      isInitiator: false,
      localStream: null,
      remoteStream: null,
      state: 'incoming',
      isMuted: false,
      isCameraOff: false,
      isSpeakerOn: false,
    };
    this.emit();
  }

  private async getMedia(callType: 'video' | 'audio'): Promise<MediaStream> {
    return (await mediaDevices.getUserMedia({
      audio: true,
      video:
        callType === 'video'
          ? {
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 },
            }
          : false,
    })) as MediaStream;
  }

  private createPC(localStream: MediaStream) {
    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    localStream.getTracks().forEach(t => this.pc!.addTrack(t, localStream));

    (this.pc as any).ontrack = (event: any) => {
      if (event.streams?.[0] && this.session) {
        this.session.remoteStream = event.streams[0];
        this.session.state = 'connected';
        this.session.startedAt = this.session.startedAt ?? new Date();
        this.emit();
      }
    };

    (this.pc as any).onicecandidate = (event: any) => {
      if (event.candidate && this.session) {
        const c = event.candidate;
        signalingService.send({
          type: 'ice',
          to: this.session.remoteUserId,
          candidate: {
            candidate: c.candidate ?? '',
            sdpMid: c.sdpMid ?? '',
            sdpMLineIndex: c.sdpMLineIndex ?? 0,
          },
        });
      }
    };

    (this.pc as any).onconnectionstatechange = () => {
      const state = (this.pc as any).connectionState;
      if ((state === 'disconnected' || state === 'failed') && this.session) {
        this.session.state = 'reconnecting';
        this.emit();
      }
    };
  }

  private async cleanup(finalState: CallState = 'ended') {
    this.session?.localStream?.getTracks().forEach(t => t.stop());
    this.pc?.close();
    this.pc = null;
    if (this.session) {
      this.session.state = finalState;
      this.session.localStream = null;
      this.session.remoteStream = null;
      this.emit();
    }
    this.session = null;
    this.pendingCandidates = [];
  }

  private emit() {
    if (this.session) {
      const snap = { ...this.session };
      this.handlers.forEach(h => h(snap));
    }
  }
}

export const webRTCService = new WebRTCService();
