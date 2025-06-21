import { pgTable, serial, text, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  telegramId: text('telegram_id').unique().notNull(),
  username: text('username'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  isAdmin: boolean('is_admin').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Orders table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  productId: integer('product_id').notNull(),
  productData: jsonb('product_data').notNull(), // Store product details
  paymentMethod: text('payment_method').notNull(),
  status: text('status').notNull().default('pending'), // pending, paid, completed, cancelled
  totalAmount: integer('total_amount').notNull(),
  currency: text('currency').notNull(),
  paymentInfo: jsonb('payment_info'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  paidAt: timestamp('paid_at'),
  completedAt: timestamp('completed_at')
});

// Support messages table
export const supportMessages = pgTable('support_messages', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  message: text('message').notNull(),
  category: text('category'), // order, payment, delivery, technical, other
  status: text('status').notNull().default('open'), // open, in_progress, resolved, closed
  adminResponse: text('admin_response'),
  respondedBy: integer('responded_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  respondedAt: timestamp('responded_at')
});

// Sessions table (for bot sessions)
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  sessionKey: text('session_key').unique().notNull(),
  data: jsonb('data').notNull(),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  supportMessages: many(supportMessages, { relationName: 'userMessages' }),
  adminResponses: many(supportMessages, { relationName: 'adminResponses' })
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id]
  })
}));

export const supportMessagesRelations = relations(supportMessages, ({ one }) => ({
  user: one(users, {
    fields: [supportMessages.userId],
    references: [users.id],
    relationName: 'userMessages'
  }),
  admin: one(users, {
    fields: [supportMessages.respondedBy],
    references: [users.id],
    relationName: 'adminResponses'
  })
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type SupportMessage = typeof supportMessages.$inferSelect;
export type InsertSupportMessage = typeof supportMessages.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;