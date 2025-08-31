import { useState, useEffect } from "react";
import { useWebRTC } from "@/hooks/use-webrtc";
import { useWebSocket } from "@/hooks/use-websocket";
import { VideoTile } from "./video-tile";
import { VideoControls } from "./video-controls";
import { SessionSidebar } from "./session-sidebar";
import { ConnectionStatus } from "./connection-status";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface VideoRoomProps {
  roomId: string;
  userId: string;
}

export function VideoRoom({ roomId, userId }: VideoRoomProps) {
  const [sessionStartTime] = useState(new Date());
  const [sessionDuration, setSessionDuration] = useState("00:00");
  const [newMessages, setNewMessages] = useState<any[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch session data
  const { data: sessionData, isLoading: isLoadingSession } = useQuery<any>({
    queryKey: ["/api/sessions/room", roomId],
    enabled: !!roomId,
  });

  // WebRTC hook
  const {
    localStream,
    remoteStream,
    isConnected,
    isVideoEnabled,
    isAudioEnabled,
    connectionState,
    localVideoRef,
    remoteVideoRef,
    initializeConnection,
    toggleVideo,
    toggleAudio,
    shareScreen,
  } = useWebRTC(roomId, userId);

  // WebSocket for real-time communication
  const { isConnected: isWSConnected, sendMessage } = useWebSocket(roomId, {
    onMessage: (message) => {
      if (message.type === "chat-message") {
        setNewMessages(prev => [...prev, message.message]);
        if (!isChatOpen) {
          setUnreadMessages(prev => prev + 1);
        }
      }
    },
  });

  // Update session status mutation
  const updateSessionMutation = useMutation({
    mutationFn: async (data: { status: string; endTime?: Date }) => {
      if (!sessionData?.id) throw new Error("No session ID");
      return apiRequest("PATCH", `/api/sessions/${sessionData.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/room", roomId] });
    },
  });

  // Initialize WebRTC when component mounts
  useEffect(() => {
    if (roomId && userId) {
      initializeConnection();
    }
  }, [roomId, userId, initializeConnection]);

  // Update session duration
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setSessionDuration(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Mark session as active when connected
  useEffect(() => {
    if (isConnected && sessionData?.status === "scheduled") {
      updateSessionMutation.mutate({
        status: "active",
      });
    }
  }, [isConnected, sessionData?.status]);

  const handleSendMessage = (message: string) => {
    if (!sessionData?.id) return;

    sendMessage({
      type: "chat-message",
      sessionId: sessionData.id,
      senderId: userId,
      content: message,
      roomId,
    });
  };

  const handleToggleChat = () => {
    setIsChatOpen(prev => !prev);
    if (!isChatOpen) {
      setUnreadMessages(0);
    }
  };

  const handleEndCall = () => {
    if (sessionData?.id) {
      updateSessionMutation.mutate({
        status: "completed",
        endTime: new Date(),
      });
    }

    toast({
      title: "Session Ended",
      description: "The consultation session has been ended.",
    });

    // In production, this would navigate to a session summary page
    window.location.href = "/dashboard";
  };

  const getConnectionQuality = (): "HD" | "SD" | "Poor" => {
    if (connectionState === "connected") return "HD";
    if (connectionState === "connecting") return "SD";
    return "Poor";
  };

  if (isLoadingSession) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen" data-testid="video-room">
      {/* Header and Connection Status */}
      <ConnectionStatus
        sessionDuration={sessionDuration}
        roomId={sessionData?.roomId || roomId}
        connectionQuality={getConnectionQuality()}
        latency={45} // This would be calculated in real implementation
        isSecure={isWSConnected && isConnected}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Conference Area */}
        <div className="flex-1 p-4 bg-muted/30 relative">
          {/* Video Grid */}
          <div className="video-grid two-participants h-full">
            {/* Local Video (Current User) */}
            <VideoTile
              name="You"
              role="patient"
              videoRef={localVideoRef}
              isVideoEnabled={isVideoEnabled}
              isAudioEnabled={isAudioEnabled}
              connectionQuality={getConnectionQuality()}
            />

            {/* Remote Video (Other Participant) */}
            <VideoTile
              name="Dr. Sarah Chen"
              role="therapist"
              videoRef={remoteVideoRef}
              isVideoEnabled={!!remoteStream}
              isAudioEnabled={!!remoteStream}
              connectionQuality={getConnectionQuality()}
            />
          </div>

          {/* Media Controls */}
          <VideoControls
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            onToggleVideo={toggleVideo}
            onToggleAudio={toggleAudio}
            onShareScreen={shareScreen}
            onToggleChat={handleToggleChat}
            onEndCall={handleEndCall}
            unreadMessages={unreadMessages}
          />
        </div>

        {/* Sidebar */}
        {isChatOpen && (
          <SessionSidebar
            sessionId={sessionData?.id || ""}
            currentUserId={userId}
            sessionDuration={sessionDuration}
            onSendMessage={handleSendMessage}
            newMessages={newMessages}
            sessionData={sessionData}
          />
        )}
      </div>
    </div>
  );
}
