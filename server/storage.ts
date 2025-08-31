import {
  users,
  consultationSessions,
  chatMessages,
  type User,
  type InsertUser,
  type UpsertUser,
  type ConsultationSession,
  type InsertConsultationSession,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Session operations
  createSession(session: InsertConsultationSession): Promise<ConsultationSession>;
  getSessionByRoomId(roomId: string): Promise<ConsultationSession | undefined>;
  getSessionById(id: string): Promise<ConsultationSession | undefined>;
  updateSessionStatus(id: string, status: string, endTime?: Date): Promise<ConsultationSession>;
  getUserSessions(userId: string): Promise<ConsultationSession[]>;

  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getSessionMessages(sessionId: string): Promise<ChatMessage[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        username: insertUser.username,
        email: insertUser.email,
        fullName: insertUser.fullName,
        role: insertUser.role as "patient" | "therapist" | "admin",
      })
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Session operations
  async createSession(sessionData: InsertConsultationSession): Promise<ConsultationSession> {
    const [session] = await db
      .insert(consultationSessions)
      .values({
        ...sessionData,
        status: (sessionData.status as "scheduled" | "active" | "completed" | "cancelled") || "scheduled",
      })
      .returning();
    return session;
  }

  async getSessionByRoomId(roomId: string): Promise<ConsultationSession | undefined> {
    const [session] = await db
      .select()
      .from(consultationSessions)
      .where(eq(consultationSessions.roomId, roomId));
    return session;
  }

  async getSessionById(id: string): Promise<ConsultationSession | undefined> {
    const [session] = await db
      .select()
      .from(consultationSessions)
      .where(eq(consultationSessions.id, id));
    return session;
  }

  async updateSessionStatus(
    id: string,
    status: string,
    endTime?: Date
  ): Promise<ConsultationSession> {
    const updateData: any = { status };
    if (endTime) {
      updateData.endTime = endTime;
    }

    const [session] = await db
      .update(consultationSessions)
      .set(updateData)
      .where(eq(consultationSessions.id, id))
      .returning();
    return session;
  }

  async getUserSessions(userId: string): Promise<ConsultationSession[]> {
    const sessions = await db
      .select()
      .from(consultationSessions)
      .where(
        and(
          eq(consultationSessions.patientId, userId)
        )
      )
      .orderBy(desc(consultationSessions.createdAt));
    return sessions;
  }

  // Chat operations
  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db
      .insert(chatMessages)
      .values({
        ...messageData,
        messageType: (messageData.messageType as "user" | "system") || "user",
      })
      .returning();
    return message;
  }

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.timestamp);
    return messages;
  }
}

export const storage = new DatabaseStorage();
