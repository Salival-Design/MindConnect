import { useParams } from "wouter";
import { VideoRoom } from "@/components/video-room";
import { useEffect } from "react";

export default function ConsultationRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  
  // For demo purposes, we'll use a static user ID
  // In production, this would come from authentication context
  const userId = "demo-user-" + Date.now();

  useEffect(() => {
    // Set page title
    document.title = `Consultation Room ${roomId} - MindConnect`;
  }, [roomId]);

  if (!roomId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Invalid Room</h1>
          <p className="text-muted-foreground">No room ID provided</p>
        </div>
      </div>
    );
  }

  return (
    <VideoRoom 
      roomId={roomId} 
      userId={userId}
    />
  );
}
