import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ConnectionStatusProps {
  sessionDuration: string;
  roomId: string;
  connectionQuality: "HD" | "SD" | "Poor";
  latency: number;
  isSecure: boolean;
}

export function ConnectionStatus({
  sessionDuration,
  roomId,
  connectionQuality,
  latency,
  isSecure,
}: ConnectionStatusProps) {
  const { toast } = useToast();

  const handleEmergencySupport = () => {
    toast({
      title: "Emergency Support",
      description: "This would connect to 24/7 crisis helpline in production",
      variant: "destructive",
    });
  };

  const handleCopyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast({
        title: "Copied!",
        description: "Room ID copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy room ID",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-brain text-white text-sm" />
            </div>
            <span className="font-bold text-xl text-foreground">MindConnect</span>
          </div>

          {/* Session Status */}
          <div className="flex items-center space-x-2 bg-muted px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-secondary rounded-full connection-indicator" />
            <span className="text-sm font-medium text-muted-foreground">Session Active</span>
          </div>

          {/* Security Indicator */}
          <div className="flex items-center space-x-2 bg-accent/10 px-3 py-1 rounded-full">
            <i className="fas fa-shield-alt text-accent text-sm" />
            <span className="text-sm font-medium text-accent">HIPAA Secured</span>
          </div>
        </div>

        {/* Session Info */}
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Session Duration</div>
            <div className="font-semibold text-foreground" data-testid="text-session-duration">
              {sessionDuration}
            </div>
          </div>

          {/* Emergency Support */}
          <Button
            onClick={handleEmergencySupport}
            className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-medium hover:bg-destructive/90 transition-colors min-w-12 min-h-12"
            data-testid="button-emergency-support"
          >
            <i className="fas fa-phone-alt mr-2" />
            Crisis Support
          </Button>

          {/* Menu */}
          <Button
            variant="ghost"
            size="icon"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors min-w-12 min-h-12"
            data-testid="button-menu"
          >
            <i className="fas fa-ellipsis-v" />
          </Button>
        </div>
      </header>

      {/* Connection Status Banner */}
      <div className="bg-secondary text-white px-6 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full connection-indicator" />
            <span className="font-medium">Secure Connection Active</span>
          </div>

          <div className="flex items-center space-x-4 text-white/80">
            <span data-testid="text-connection-quality">Quality: {connectionQuality}</span>
            <span data-testid="text-latency">Latency: {latency}ms</span>
            <span>Encryption: AES-256</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-white/80" data-testid="text-room-id-display">Room ID: {roomId}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyRoomId}
            className="text-white/80 hover:text-white transition-colors p-1"
            data-testid="button-copy-room-id"
          >
            <i className="fas fa-copy mr-1" />
            Copy
          </Button>
        </div>
      </div>
    </>
  );
}
