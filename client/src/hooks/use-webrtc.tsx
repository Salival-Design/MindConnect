import { useState, useRef, useCallback, useEffect } from "react";
import { useWebSocket } from "./use-websocket.tsx";

export interface WebRTCState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  connectionState: RTCPeerConnectionState;
}

export function useWebRTC(roomId: string, userId: string) {
  const [state, setState] = useState<WebRTCState>({
    localStream: null,
    remoteStream: null,
    isConnected: false,
    isVideoEnabled: true,
    isAudioEnabled: true,
    connectionState: "new",
  });

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const { sendMessage } = useWebSocket(roomId, {
    onMessage: handleWebSocketMessage,
  });

  // Initialize WebRTC connection
  const initializeConnection = useCallback(async () => {
    try {
      // Get ICE servers from backend
      const response = await fetch("/api/ice-servers");
      const iceServers = await response.json();

      // Create peer connection
      peerConnection.current = new RTCPeerConnection({ iceServers });

      // Handle connection state changes
      peerConnection.current.onconnectionstatechange = () => {
        if (peerConnection.current) {
          setState(prev => ({
            ...prev,
            connectionState: peerConnection.current!.connectionState,
            isConnected: peerConnection.current!.connectionState === "connected",
          }));
        }
      };

      // Handle remote stream
      peerConnection.current.ontrack = (event) => {
        const [remoteStream] = event.streams;
        setState(prev => ({ ...prev, remoteStream }));
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      // Handle ICE candidates
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          sendMessage({
            type: "ice-candidate",
            candidate: event.candidate,
            roomId,
            userId,
          });
        }
      };

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setState(prev => ({ ...prev, localStream: stream }));
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Add tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.current?.addTrack(track, stream);
      });

    } catch (error) {
      console.error("Error initializing WebRTC:", error);
    }
  }, [roomId, userId, sendMessage]);

  // Handle WebSocket messages
  async function handleWebSocketMessage(message: any) {
    if (!peerConnection.current) return;

    switch (message.type) {
      case "user-joined":
        // Create and send offer
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        sendMessage({
          type: "webrtc-offer",
          offer,
          roomId,
          userId,
        });
        break;

      case "webrtc-offer":
        await peerConnection.current.setRemoteDescription(message.offer);
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        sendMessage({
          type: "webrtc-answer",
          answer,
          roomId,
          userId,
        });
        break;

      case "webrtc-answer":
        await peerConnection.current.setRemoteDescription(message.answer);
        break;

      case "ice-candidate":
        await peerConnection.current.addIceCandidate(message.candidate);
        break;
    }
  }

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (state.localStream) {
      const videoTrack = state.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !state.isVideoEnabled;
        setState(prev => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }));
      }
    }
  }, [state.localStream, state.isVideoEnabled]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (state.localStream) {
      const audioTrack = state.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !state.isAudioEnabled;
        setState(prev => ({ ...prev, isAudioEnabled: !prev.isAudioEnabled }));
      }
    }
  }, [state.localStream, state.isAudioEnabled]);

  // Share screen
  const shareScreen = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      const videoTrack = screenStream.getVideoTracks()[0];
      const sender = peerConnection.current?.getSenders().find(
        s => s.track?.kind === "video"
      );

      if (sender && videoTrack) {
        await sender.replaceTrack(videoTrack);
      }

      // Handle screen share end
      videoTrack.onended = async () => {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const cameraTrack = cameraStream.getVideoTracks()[0];
        
        if (sender && cameraTrack) {
          await sender.replaceTrack(cameraTrack);
        }
      };
    } catch (error) {
      console.error("Error sharing screen:", error);
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (state.localStream) {
        state.localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnection.current) {
        peerConnection.current.close();
      }
    };
  }, []);

  return {
    ...state,
    localVideoRef,
    remoteVideoRef,
    initializeConnection,
    toggleVideo,
    toggleAudio,
    shareScreen,
  };
}
