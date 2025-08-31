import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface ChatMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: string;
  messageType: "user" | "system";
  sender?: {
    fullName: string;
    role: string;
  };
}

interface ChatPanelProps {
  sessionId: string;
  currentUserId: string;
  onSendMessage: (message: string) => void;
  newMessages: ChatMessage[];
}

export function ChatPanel({
  sessionId,
  currentUserId,
  onSendMessage,
  newMessages,
}: ChatPanelProps) {
  const [messageInput, setMessageInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch chat history
  const { data: chatHistory = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/sessions", sessionId, "messages"],
    enabled: !!sessionId,
  });

  // Combine history and new messages
  const allMessages = [...chatHistory, ...newMessages];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [allMessages]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput.trim());
      setMessageInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageSenderInfo = (message: ChatMessage) => {
    if (message.messageType === "system") {
      return { name: "System", role: "system", initials: "SYS" };
    }
    
    const isCurrentUser = message.senderId === currentUserId;
    const senderName = message.sender?.fullName || (isCurrentUser ? "You" : "Unknown");
    const role = message.sender?.role || "user";
    
    return {
      name: senderName,
      role,
      initials: senderName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
    };
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef} data-testid="chat-messages-area">
        <div className="space-y-4">
          {allMessages.map((message) => {
            const senderInfo = getMessageSenderInfo(message);
            const isCurrentUser = message.senderId === currentUserId;
            const isSystem = message.messageType === "system";

            if (isSystem) {
              return (
                <div key={message.id} className="flex justify-center" data-testid={`system-message-${message.id}`}>
                  <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                    {message.message}
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={message.id} 
                className="flex items-start space-x-3 chat-message"
                data-testid={`chat-message-${message.id}`}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    senderInfo.role === "therapist" ? "bg-primary" : "bg-accent"
                  }`}
                >
                  <span className="text-white text-xs font-semibold">
                    {senderInfo.initials}
                  </span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm text-foreground" data-testid={`message-sender-${message.id}`}>
                      {senderInfo.name}
                    </span>
                    <span className="text-xs text-muted-foreground" data-testid={`message-time-${message.id}`}>
                      {format(new Date(message.timestamp), "h:mm a")}
                    </span>
                    <div className="flex items-center space-x-1">
                      <i className="fas fa-lock text-accent text-xs" />
                      <span className="text-xs text-accent">Encrypted</span>
                    </div>
                  </div>
                  
                  <div 
                    className={`rounded-lg p-3 text-sm text-foreground border ${
                      senderInfo.role === "therapist"
                        ? "bg-primary/10 border-primary/20"
                        : "bg-muted border-border"
                    }`}
                    data-testid={`message-content-${message.id}`}
                  >
                    {message.message}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Type a secure message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
            data-testid="input-chat-message"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className="w-12 h-12 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            data-testid="button-send-message"
            aria-label="Send Message"
          >
            <i className="fas fa-paper-plane" />
          </Button>
        </div>

        {/* Security Notice */}
        <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
          <i className="fas fa-lock text-accent" />
          <span>Messages are encrypted and stored securely per HIPAA requirements</span>
        </div>
      </div>
    </div>
  );
}
