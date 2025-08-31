import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Video, VideoOff, Monitor, MessageCircle, Settings, PhoneOff } from "lucide-react";

interface VideoControlsProps {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onShareScreen: () => void;
  onToggleChat: () => void;
  onEndCall: () => void;
  unreadMessages: number;
}

export function VideoControls({
  isVideoEnabled,
  isAudioEnabled,
  onToggleVideo,
  onToggleAudio,
  onShareScreen,
  onToggleChat,
  onEndCall,
  unreadMessages,
}: VideoControlsProps) {
  const { toast } = useToast();

  const handleEmergencySupport = () => {
    toast({
      title: "Emergency Support",
      description: "Connecting to 24/7 crisis helpline...",
      variant: "destructive",
    });
    // In production, this would connect to actual emergency services
  };

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl border border-border">
        <div className="flex items-center space-x-4">
          
          {/* Microphone Toggle */}
          <Button
            size="lg"
            className={`w-12 h-12 rounded-xl transition-colors ${
              isAudioEnabled
                ? "bg-secondary text-white hover:bg-secondary/90"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            onClick={onToggleAudio}
            data-testid="button-toggle-microphone"
            aria-label="Toggle Microphone"
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>

          {/* Video Toggle */}
          <Button
            size="lg"
            className={`w-12 h-12 rounded-xl transition-colors ${
              isVideoEnabled
                ? "bg-secondary text-white hover:bg-secondary/90"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            onClick={onToggleVideo}
            data-testid="button-toggle-video"
            aria-label="Toggle Video"
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          {/* Screen Share */}
          <Button
            size="lg"
            className="w-12 h-12 bg-muted text-muted-foreground rounded-xl hover:bg-accent hover:text-white transition-colors"
            onClick={onShareScreen}
            data-testid="button-share-screen"
            aria-label="Share Screen"
          >
            <Monitor className="w-5 h-5" />
          </Button>

          {/* Chat Toggle */}
          <Button
            size="lg"
            className="w-12 h-12 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors relative"
            onClick={onToggleChat}
            data-testid="button-toggle-chat"
            aria-label="Toggle Chat"
          >
            <MessageCircle className="w-5 h-5" />
            {unreadMessages > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center" data-testid="chat-unread-count">
                {unreadMessages}
              </div>
            )}
          </Button>

          {/* Settings */}
          <Button
            size="lg"
            className="w-12 h-12 bg-muted text-muted-foreground rounded-xl hover:bg-muted/80 transition-colors"
            data-testid="button-settings"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* End Call */}
          <Button
            size="lg"
            className="w-12 h-12 bg-destructive text-white rounded-xl hover:bg-destructive/90 transition-colors ml-4"
            onClick={onEndCall}
            data-testid="button-end-call"
            aria-label="End Call"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
