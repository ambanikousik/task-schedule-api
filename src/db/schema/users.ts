import { pgTable, serial, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable('users', {
    id: serial('id',).primaryKey(),
    username: varchar('username',).notNull(),
    email: varchar('email',).notNull(),
    password: varchar('password',).notNull(),
}, (table) => {
    return {
        username: uniqueIndex("username_idx").on(table.username),
    };
});



// Schema for inserting a user - can be used to validate API requests
export const insertUserSchema = createInsertSchema(users);

// Schema for selecting a user - can be used to validate API responses
export const selectUserSchema = createSelectSchema(users);