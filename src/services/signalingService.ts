/**
 * signalingService.ts
 * Pure WebSocket signaling — no paid SDK.
 */

// SDP type values from WebRTC spec — no import needed
type SDPType = 'offer' | 'answer' | 'pranswer' | 'rollback';

// react-native-webrtc requires sdp as non-optional string
export interface RNSessionDescriptionInit {
  type: SDPType;
  sdp: string;
}

// ICE candidate shape matching react-native-webrtc
export interface RNIceCandidateInit {
  candidate: string;
  sdpMid: string;
  sdpMLineIndex: number;
}

export type SignalType =
  | 'register'
  | 'registered'
  | 'call'
  | 'incoming'
  | 'answer'
  | 'ice'
  | 'hangup'
  | 'busy'
  | 'error';

export interface SignalMessage {
  type: SignalType;
  from?: string;
  to?: string;
  offer?: RNSessionDescriptionInit;
  answer?: RNSessionDescriptionInit;
  candidate?: RNIceCandidateInit;
  callType?: 'video' | 'audio';
  error?: string;
}

type MessageHandler = (msg: SignalMessage) => void;

// Match React Native's WebSocketMessageEvent where data is optional
interface WSMessageEvent {
  data?: string;
}

class SignalingService {
  private ws: WebSocket | null = null;
  private userId: string | null = null;
  private serverUrl: string = '';
  private handlers: Map<SignalType, MessageHandler[]> = new Map();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  connect(serverUrl: string, userId: string): Promise<void> {
    this.serverUrl = serverUrl;
    this.userId = userId;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(serverUrl);

        this.ws.onopen = () => {
          this.send({ type: 'register', from: userId });
          resolve();
        };

        this.ws.onmessage = (event: WSMessageEvent) => {
          if (!event.data) return;
          try {
            const msg: SignalMessage = JSON.parse(event.data);
            (this.handlers.get(msg.type) ?? []).forEach(h => h(msg));
          } catch {
            console.warn('[Signaling] Bad message', event.data);
          }
        };

        this.ws.onerror = () => {
          reject(new Error('[Signaling] WebSocket connection failed'));
        };

        this.ws.onclose = () => {
          this.scheduleReconnect();
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.serverUrl && this.userId) {
        this.connect(this.serverUrl, this.userId).catch(() => {});
      }
    }, 3000);
  }

  send(msg: SignalMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  on(type: SignalType, handler: MessageHandler) {
    const list = this.handlers.get(type) ?? [];
    list.push(handler);
    this.handlers.set(type, list);
  }

  off(type: SignalType, handler: MessageHandler) {
    this.handlers.set(
      type,
      (this.handlers.get(type) ?? []).filter(h => h !== handler),
    );
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const signalingService = new SignalingService();
