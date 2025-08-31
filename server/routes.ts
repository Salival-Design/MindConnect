import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { getTwilioIceServers } from "./twilio-service.js";
import { insertConsultationSessionSchema, insertChatMessageSchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // REST API Routes
  
  // Create new consultation session
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertConsultationSessionSchema.parse(req.body);
      const session = await storage.createSession({
        ...sessionData,
        roomId: sessionData.roomId || `room-${randomUUID()}`,
      });
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(400).json({ message: "Failed to create session" });
    }
  });

  // Get session by room ID
  app.get("/api/sessions/room/:roomId", async (req, res) => {
    try {
      const session = await storage.getSessionByRoomId(req.params.roomId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  // Update session status
  app.patch("/api/sessions/:id", async (req, res) => {
    try {
      const { status, endTime } = req.body;
      const session = await storage.updateSessionStatus(
        req.params.id,
        status,
        endTime ? new Date(endTime) : undefined
      );
      res.json(session);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  // Get user's sessions
  app.get("/api/users/:userId/sessions", async (req, res) => {
    try {
      const sessions = await storage.getUserSessions(req.params.userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      res.status(500).json({ message: "Failed to fetch user sessions" });
    }
  });

  // Get chat history
  app.get("/api/sessions/:sessionId/messages", async (req, res) => {
    try {
      const messages = await storage.getSessionMessages(req.params.sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Get Twilio ICE servers
  app.get("/api/ice-servers", async (req, res) => {
    try {
      const iceServers = await getTwilioIceServers();
      res.json(iceServers);
    } catch (error) {
      console.error("Error getting ICE servers:", error);
      res.status(500).json({ message: "Failed to get ICE servers" });
    }
  });

  // Create demo room
  app.post("/api/demo-room", async (req, res) => {
    try {
      const roomId = `demo-${randomUUID()}`;
      
      // Create a demo patient user
      const demoPatient = await storage.createUser({
        username: `demo-patient-${Date.now()}`,
        email: `demo-patient-${Date.now()}@mindconnect.com`,
        fullName: "Demo Patient",
        role: "patient",
      });

      const session = await storage.createSession({
        roomId,
        patientId: demoPatient.id,
        status: "scheduled",
      });

      res.json({ session, roomId });
    } catch (error) {
      console.error("Error creating demo room:", error);
      res.status(500).json({ message: "Failed to create demo room" });
    }
  });

  // WebSocket Server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const rooms = new Map<string, Set<WebSocket>>();
  const userRooms = new Map<WebSocket, string>();

  wss.on("connection", (ws) => {
    console.log("New WebSocket connection");

    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        const roomId = userRooms.get(ws);

        switch (message.type) {
          case "join-room":
            const { roomId: newRoomId, userId } = message;
            
            // Leave previous room if any
            if (roomId) {
              const oldRoom = rooms.get(roomId);
              if (oldRoom) {
                oldRoom.delete(ws);
                if (oldRoom.size === 0) {
                  rooms.delete(roomId);
                }
              }
            }

            // Join new room
            userRooms.set(ws, newRoomId);
            if (!rooms.has(newRoomId)) {
              rooms.set(newRoomId, new Set());
            }
            rooms.get(newRoomId)!.add(ws);

            // Broadcast user joined
            const joinedRoom = rooms.get(newRoomId);
            if (joinedRoom) {
              joinedRoom.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    type: "user-joined",
                    userId,
                    roomId: newRoomId,
                  }));
                }
              });
            }
            break;

          case "webrtc-offer":
          case "webrtc-answer":
          case "ice-candidate":
            // Forward WebRTC signaling to other participants
            if (roomId) {
              const room = rooms.get(roomId);
              if (room) {
                room.forEach((client) => {
                  if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(message));
                  }
                });
              }
            }
            break;

          case "chat-message":
            const { sessionId, senderId, content } = message;
            
            // Store message in database
            const chatMessage = await storage.createChatMessage({
              sessionId,
              senderId,
              message: content,
            });

            // Broadcast to room participants
            if (roomId) {
              const room = rooms.get(roomId);
              if (room) {
                room.forEach((client) => {
                  if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                      type: "chat-message",
                      message: chatMessage,
                    }));
                  }
                });
              }
            }
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      const roomId = userRooms.get(ws);
      if (roomId) {
        const room = rooms.get(roomId);
        if (room) {
          room.delete(ws);
          if (room.size === 0) {
            rooms.delete(roomId);
          } else {
            // Notify other participants
            room.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: "user-left",
                  roomId,
                }));
              }
            });
          }
        }
        userRooms.delete(ws);
      }
    });
  });

  return httpServer;
}
