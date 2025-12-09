import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull().default("User"),
  avatar: text("avatar").notNull().default("earth"),
  units: text("units").notNull().default("imperial"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sessions table for auth
export const sessions = pgTable("sessions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User goals
export const userGoals = pgTable("user_goals", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  dailyCalories: integer("daily_calories").notNull().default(2200),
  dailyProtein: integer("daily_protein").notNull().default(150),
  dailyCarbs: integer("daily_carbs").notNull().default(250),
  dailyFats: integer("daily_fats").notNull().default(70),
  weeklyWorkouts: integer("weekly_workouts").notNull().default(4),
  targetWeight: real("target_weight").notNull().default(160),
});

// Workouts
export const workouts = pgTable("workouts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  exercises: jsonb("exercises").notNull().default([]),
  scheduledDays: jsonb("scheduled_days").notNull().default([]),
  color: text("color").notNull().default("#7B68EE"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Workout logs
export const workoutLogs = pgTable("workout_logs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  workoutId: varchar("workout_id").notNull(),
  workoutName: text("workout_name").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  duration: integer("duration").notNull().default(0),
  exerciseLogs: jsonb("exercise_logs").notNull().default([]),
  notes: text("notes"),
});

// Foods (saved foods library)
export const foods = pgTable("foods", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  servingSize: text("serving_size").notNull(),
  calories: integer("calories").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fats: real("fats").notNull(),
  fiber: real("fiber").notNull().default(0),
  isSaved: boolean("is_saved").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Food entries (daily log)
export const foodEntries = pgTable("food_entries", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  foodId: varchar("food_id")
    .notNull()
    .references(() => foods.id, { onDelete: "cascade" }),
  mealType: text("meal_type").notNull(),
  servings: real("servings").notNull().default(1),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Weight entries
export const weightEntries = pgTable("weight_entries", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  weight: real("weight").notNull(),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Meals (saved meal recipes)
export const meals = pgTable("meals", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  ingredients: jsonb("ingredients").notNull().default([]),
  totalServings: integer("total_servings").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  name: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type UserGoals = typeof userGoals.$inferSelect;
export type Workout = typeof workouts.$inferSelect;
export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type Food = typeof foods.$inferSelect;
export type FoodEntry = typeof foodEntries.$inferSelect;
export type WeightEntry = typeof weightEntries.$inferSelect;
export type Meal = typeof meals.$inferSelect;
