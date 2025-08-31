import { useState, useRef, useCallback, useEffect } from "react";

interface WebSocketOptions {
  onMessage?: (message: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket(roomId: string, options: WebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<"connecting" | "connected" | "disconnected">("disconnected");
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionState("connecting");
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onopen = () => {
      setIsConnected(true);
      setConnectionState("connected");
      options.onConnect?.();
      
      // Join room
      if (roomId) {
        sendMessage({
          type: "join-room",
          roomId,
          userId: "current-user", // This should come from auth context
        });
      }
    };

    socketRef.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        options.onMessage?.(message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socketRef.current.onclose = () => {
      setIsConnected(false);
      setConnectionState("disconnected");
      options.onDisconnect?.();
      
      // Auto-reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }, [roomId, options]);

  const sendMessage = useCallback((message: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsConnected(false);
    setConnectionState("disconnected");
  }, []);

  useEffect(() => {
    if (roomId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [roomId]);

  return {
    isConnected,
    connectionState,
    sendMessage,
    connect,
    disconnect,
  };
}
