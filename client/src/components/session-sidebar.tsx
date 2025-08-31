import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatPanel } from "./chat-panel";

type SidebarTab = "chat" | "notes" | "session";

interface SessionSidebarProps {
  sessionId: string;
  currentUserId: string;
  sessionDuration: string;
  onSendMessage: (message: string) => void;
  newMessages: any[];
  sessionData: any;
}

export function SessionSidebar({
  sessionId,
  currentUserId,
  sessionDuration,
  onSendMessage,
  newMessages,
  sessionData,
}: SessionSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>("chat");
  const [notes, setNotes] = useState("");

  const tabs = [
    { id: "chat" as const, label: "Chat" },
    { id: "notes" as const, label: "Notes" },
    { id: "session" as const, label: "Session" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "chat":
        return (
          <ChatPanel
            sessionId={sessionId}
            currentUserId={currentUserId}
            onSendMessage={onSendMessage}
            newMessages={newMessages}
          />
        );
      
      case "notes":
        return (
          <div className="flex-1 p-4">
            <div className="mb-4">
              <h3 className="font-semibold text-foreground mb-2">Session Notes</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Private notes for this consultation session
              </p>
            </div>
            <Textarea
              placeholder="Add your session notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[300px] resize-none"
              data-testid="textarea-session-notes"
            />
            <Button 
              className="w-full mt-4" 
              data-testid="button-save-notes"
            >
              Save Notes
            </Button>
          </div>
        );
      
      case "session":
        return (
          <div className="flex-1 p-4">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-4">Session Information</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="text-sm font-medium" data-testid="text-session-duration">
                      {sessionDuration}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Room ID</span>
                    <span className="text-sm font-medium" data-testid="text-room-id">
                      {sessionData?.roomId || "Loading..."}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className="text-sm font-medium capitalize" data-testid="text-session-status">
                      {sessionData?.status || "Active"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Participants</span>
                    <span className="text-sm font-medium" data-testid="text-participant-count">2</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-medium text-foreground mb-3">Security Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <i className="fas fa-shield-alt text-accent" />
                    <span className="text-accent">HIPAA Compliant</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <i className="fas fa-lock text-accent" />
                    <span className="text-accent">End-to-End Encrypted</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <i className="fas fa-eye-slash text-accent" />
                    <span className="text-accent">No Recording</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-96 bg-card border-l border-border flex flex-col" data-testid="session-sidebar">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border">
        <div className="flex space-x-1 bg-muted rounded-lg p-1">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              className={`flex-1 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab(tab.id)}
              data-testid={`button-tab-${tab.id}`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
