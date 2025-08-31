interface VideoTileProps {
  name: string;
  role: "patient" | "therapist";
  videoRef: React.RefObject<HTMLVideoElement>;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  connectionQuality: "HD" | "SD" | "Poor";
}

export function VideoTile({
  name,
  role,
  videoRef,
  isVideoEnabled,
  isAudioEnabled,
  connectionQuality,
}: VideoTileProps) {
  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getQualityBars = () => {
    switch (connectionQuality) {
      case "HD":
        return [true, true, true];
      case "SD":
        return [true, true, false];
      case "Poor":
        return [true, false, false];
      default:
        return [false, false, false];
    }
  };

  return (
    <div className="relative bg-card rounded-xl overflow-hidden shadow-lg border border-border" data-testid={`video-tile-${role}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        muted={role === "patient"} // Mute own video
        playsInline
        className="w-full h-full object-cover"
        data-testid={`video-element-${role}`}
      />

      {/* Video disabled overlay */}
      {!isVideoEnabled && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-semibold">
              {getInitials(name)}
            </span>
          </div>
        </div>
      )}

      {/* Video Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* Participant Info */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex items-center justify-between">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="text-white font-medium text-sm" data-testid={`participant-name-${role}`}>
              {name}
            </div>
            <div className="text-white/80 text-xs capitalize">
              {role === "therapist" ? "Licensed Psychologist" : "Patient"}
            </div>
          </div>

          {/* Audio/Video Status */}
          <div className="flex space-x-2">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isAudioEnabled ? "bg-secondary" : "bg-muted"
              }`}
              data-testid={`audio-status-${role}`}
            >
              <i className={`fas ${isAudioEnabled ? "fa-microphone" : "fa-microphone-slash"} text-white text-xs`} />
            </div>
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isVideoEnabled ? "bg-secondary" : "bg-muted"
              }`}
              data-testid={`video-status-${role}`}
            >
              <i className={`fas ${isVideoEnabled ? "fa-video" : "fa-video-slash"} text-white text-xs`} />
            </div>
          </div>
        </div>
      </div>

      {/* Connection Quality */}
      <div className="absolute top-4 right-4">
        <div className="bg-secondary/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1" data-testid={`connection-quality-${role}`}>
          {getQualityBars().map((active, index) => (
            <div
              key={index}
              className={`w-1 rounded-full ${
                active ? "bg-white h-3" : "bg-white/50 h-2"
              }`}
            />
          ))}
          <span className="text-white text-xs ml-1">{connectionQuality}</span>
        </div>
      </div>
    </div>
  );
}
