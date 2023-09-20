import { boolean, integer, pgTable, serial, timestamp, } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./users";

export const tasks = pgTable('tasks', {
  id: serial('id',).primaryKey(),
  executionTime: timestamp('execution_time',).notNull(),
  user: integer('user_id').references(() => users.id),
  executed: boolean('executed',).default(false),
  createdAt: timestamp('created_at',).defaultNow(),
  updatedAt: timestamp('updated_at',).defaultNow(),
});



// Schema for inserting a user - can be used to validate API requests
export const insertTasksSchema = createInsertSchema(tasks);

// Schema for selecting a user - can be used to validate API responses
export const selectTasksSchema = createSelectSchema(tasks);