import { users, orders, supportMessages, sessions, type User, type InsertUser, type Order, type InsertOrder, type SupportMessage, type InsertSupportMessage } from "../shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(telegramId: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(telegramId: string, updates: Partial<User>): Promise<User | null>;
  
  // Order methods
  createOrder(orderData: InsertOrder): Promise<Order>;
  getOrder(orderId: number): Promise<Order | undefined>;
  getUserOrders(userId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(orderId: number, status: string, notes?: string): Promise<Order | null>;
  markOrderAsPaid(orderId: number, paymentInfo?: any): Promise<Order | null>;
  markOrderAsCompleted(orderId: number): Promise<Order | null>;
  getPendingOrders(): Promise<Order[]>;
  
  // Support methods
  createSupportMessage(messageData: InsertSupportMessage): Promise<SupportMessage>;
  getSupportMessages(userId: number): Promise<SupportMessage[]>;
  updateSupportMessage(messageId: number, updates: Partial<SupportMessage>): Promise<SupportMessage | null>;
  
  // Session methods
  getSession(sessionKey: string): Promise<any>;
  setSession(sessionKey: string, data: any): Promise<void>;
  deleteSession(sessionKey: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(telegramId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        updatedAt: new Date()
      })
      .returning();
    return user;
  }

  async updateUser(telegramId: string, updates: Partial<User>): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(users.telegramId, telegramId))
      .returning();
    return user || null;
  }

  // Order methods
  async createOrder(orderData: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values({
        ...orderData,
        updatedAt: new Date()
      })
      .returning();
    return order;
  }

  async getOrder(orderId: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    return order || undefined;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(orderId: number, status: string, notes?: string): Promise<Order | null> {
    const updateData: any = {
      status,
      updatedAt: new Date()
    };
    
    if (notes) updateData.notes = notes;
    if (status === 'completed') updateData.completedAt = new Date();

    const [order] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, orderId))
      .returning();
    return order || null;
  }

  async markOrderAsPaid(orderId: number, paymentInfo?: any): Promise<Order | null> {
    const [order] = await db
      .update(orders)
      .set({
        status: 'paid',
        paidAt: new Date(),
        paymentInfo,
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId))
      .returning();
    return order || null;
  }

  async markOrderAsCompleted(orderId: number): Promise<Order | null> {
    const [order] = await db
      .update(orders)
      .set({
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId))
      .returning();
    return order || null;
  }

  async getPendingOrders(): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(and(
        eq(orders.status, 'pending'),
        eq(orders.status, 'paid')
      ))
      .orderBy(desc(orders.createdAt));
  }

  // Support methods
  async createSupportMessage(messageData: InsertSupportMessage): Promise<SupportMessage> {
    const [message] = await db
      .insert(supportMessages)
      .values(messageData)
      .returning();
    return message;
  }

  async getSupportMessages(userId: number): Promise<SupportMessage[]> {
    return await db
      .select()
      .from(supportMessages)
      .where(eq(supportMessages.userId, userId))
      .orderBy(desc(supportMessages.createdAt));
  }

  async updateSupportMessage(messageId: number, updates: Partial<SupportMessage>): Promise<SupportMessage | null> {
    const [message] = await db
      .update(supportMessages)
      .set(updates)
      .where(eq(supportMessages.id, messageId))
      .returning();
    return message || null;
  }

  // Session methods
  async getSession(sessionKey: string): Promise<any> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionKey, sessionKey));
    
    if (!session) return {};
    
    // Check if session expired
    if (session.expiresAt && session.expiresAt < new Date()) {
      await this.deleteSession(sessionKey);
      return {};
    }
    
    return session.data || {};
  }

  async setSession(sessionKey: string, data: any): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    await db
      .insert(sessions)
      .values({
        sessionKey,
        data,
        expiresAt,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: sessions.sessionKey,
        set: {
          data,
          expiresAt,
          updatedAt: new Date()
        }
      });
  }

  async deleteSession(sessionKey: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.sessionKey, sessionKey));
  }
}

export const storage = new DatabaseStorage();