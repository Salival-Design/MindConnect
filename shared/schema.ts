import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, index, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().$type<"patient" | "therapist" | "admin">().default("patient"),
  isActive: boolean("is_active").notNull().default(true),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sessions table for consultation sessions
export const consultationSessions = pgTable("consultation_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: text("room_id").notNull().unique(),
  patientId: varchar("patient_id").notNull().references(() => users.id),
  therapistId: varchar("therapist_id").references(() => users.id),
  status: text("status").notNull().$type<"scheduled" | "active" | "completed" | "cancelled">().default("scheduled"),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  duration: text("duration"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat Messages table
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => consultationSessions.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  messageType: text("message_type").notNull().$type<"user" | "system">().default("user"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  patientSessions: many(consultationSessions, { relationName: "patient" }),
  therapistSessions: many(consultationSessions, { relationName: "therapist" }),
  chatMessages: many(chatMessages),
}));

export const consultationSessionsRelations = relations(consultationSessions, ({ one, many }) => ({
  patient: one(users, {
    fields: [consultationSessions.patientId],
    references: [users.id],
    relationName: "patient",
  }),
  therapist: one(users, {
    fields: [consultationSessions.therapistId],
    references: [users.id],
    relationName: "therapist",
  }),
  chatMessages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(consultationSessions, {
    fields: [chatMessages.sessionId],
    references: [consultationSessions.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  fullName: true,
  role: true,
});

export const insertConsultationSessionSchema = createInsertSchema(consultationSessions).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;

export type ConsultationSession = typeof consultationSessions.$inferSelect;
export type InsertConsultationSession = z.infer<typeof insertConsultationSessionSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
