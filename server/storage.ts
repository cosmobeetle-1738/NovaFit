import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import * as schema from "../shared/schema";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export interface IStorage {
  // Users
  getUser(id: string): Promise<schema.User | undefined>;
  getUserByEmail(email: string): Promise<schema.User | undefined>;
  createUser(email: string, password: string, name: string): Promise<schema.User>;
  updateUser(id: string, data: Partial<schema.User>): Promise<schema.User | undefined>;
  
  // Sessions
  createSession(userId: string): Promise<schema.Session>;
  getSession(id: string): Promise<schema.Session | undefined>;
  deleteSession(id: string): Promise<void>;
  deleteExpiredSessions(): Promise<void>;
  
  // User Goals
  getUserGoals(userId: string): Promise<schema.UserGoals | undefined>;
  upsertUserGoals(userId: string, goals: Partial<schema.UserGoals>): Promise<schema.UserGoals>;
  
  // Workouts
  getWorkouts(userId: string): Promise<schema.Workout[]>;
  getWorkout(id: string, userId: string): Promise<schema.Workout | undefined>;
  createWorkout(userId: string, workout: Omit<schema.Workout, 'id' | 'userId' | 'createdAt'>): Promise<schema.Workout>;
  updateWorkout(id: string, userId: string, data: Partial<schema.Workout>): Promise<schema.Workout | undefined>;
  deleteWorkout(id: string, userId: string): Promise<void>;
  
  // Workout Logs
  getWorkoutLogs(userId: string): Promise<schema.WorkoutLog[]>;
  createWorkoutLog(userId: string, log: Omit<schema.WorkoutLog, 'id' | 'userId'>): Promise<schema.WorkoutLog>;
  
  // Foods
  getFoods(userId: string): Promise<schema.Food[]>;
  getFood(id: string, userId: string): Promise<schema.Food | undefined>;
  createFood(userId: string, food: Omit<schema.Food, 'id' | 'userId' | 'createdAt'>): Promise<schema.Food>;
  deleteFood(id: string, userId: string): Promise<void>;
  
  // Food Entries
  getFoodEntries(userId: string, date?: string): Promise<schema.FoodEntry[]>;
  createFoodEntry(userId: string, entry: Omit<schema.FoodEntry, 'id' | 'userId' | 'createdAt'>): Promise<schema.FoodEntry>;
  deleteFoodEntry(id: string, userId: string): Promise<void>;
  
  // Weight Entries
  getWeightEntries(userId: string): Promise<schema.WeightEntry[]>;
  createWeightEntry(userId: string, entry: Omit<schema.WeightEntry, 'id' | 'userId' | 'createdAt'>): Promise<schema.WeightEntry>;
  
  // Meals
  getMeals(userId: string): Promise<schema.Meal[]>;
  createMeal(userId: string, meal: Omit<schema.Meal, 'id' | 'userId' | 'createdAt'>): Promise<schema.Meal>;
  deleteMeal(id: string, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<schema.User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<schema.User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return result[0];
  }

  async createUser(email: string, password: string, name: string): Promise<schema.User> {
    const result = await db.insert(schema.users).values({
      email,
      password,
      name,
    }).returning();
    return result[0];
  }

  async updateUser(id: string, data: Partial<schema.User>): Promise<schema.User | undefined> {
    const result = await db.update(schema.users)
      .set(data)
      .where(eq(schema.users.id, id))
      .returning();
    return result[0];
  }

  // Sessions
  async createSession(userId: string): Promise<schema.Session> {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const result = await db.insert(schema.sessions).values({
      userId,
      expiresAt,
    }).returning();
    return result[0];
  }

  async getSession(id: string): Promise<schema.Session | undefined> {
    const result = await db.select().from(schema.sessions)
      .where(eq(schema.sessions.id, id));
    if (result[0] && new Date(result[0].expiresAt) > new Date()) {
      return result[0];
    }
    return undefined;
  }

  async deleteSession(id: string): Promise<void> {
    await db.delete(schema.sessions).where(eq(schema.sessions.id, id));
  }

  async deleteExpiredSessions(): Promise<void> {
    await db.delete(schema.sessions).where(
      eq(schema.sessions.expiresAt, new Date())
    );
  }

  // User Goals
  async getUserGoals(userId: string): Promise<schema.UserGoals | undefined> {
    const result = await db.select().from(schema.userGoals)
      .where(eq(schema.userGoals.userId, userId));
    return result[0];
  }

  async upsertUserGoals(userId: string, goals: Partial<schema.UserGoals>): Promise<schema.UserGoals> {
    const existing = await this.getUserGoals(userId);
    if (existing) {
      const result = await db.update(schema.userGoals)
        .set(goals)
        .where(eq(schema.userGoals.userId, userId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(schema.userGoals).values({
        userId,
        ...goals,
      }).returning();
      return result[0];
    }
  }

  // Workouts
  async getWorkouts(userId: string): Promise<schema.Workout[]> {
    return db.select().from(schema.workouts)
      .where(eq(schema.workouts.userId, userId));
  }

  async getWorkout(id: string, userId: string): Promise<schema.Workout | undefined> {
    const result = await db.select().from(schema.workouts)
      .where(and(eq(schema.workouts.id, id), eq(schema.workouts.userId, userId)));
    return result[0];
  }

  async createWorkout(userId: string, workout: Omit<schema.Workout, 'id' | 'userId' | 'createdAt'>): Promise<schema.Workout> {
    const result = await db.insert(schema.workouts).values({
      userId,
      ...workout,
    }).returning();
    return result[0];
  }

  async updateWorkout(id: string, userId: string, data: Partial<schema.Workout>): Promise<schema.Workout | undefined> {
    const result = await db.update(schema.workouts)
      .set(data)
      .where(and(eq(schema.workouts.id, id), eq(schema.workouts.userId, userId)))
      .returning();
    return result[0];
  }

  async deleteWorkout(id: string, userId: string): Promise<void> {
    await db.delete(schema.workouts)
      .where(and(eq(schema.workouts.id, id), eq(schema.workouts.userId, userId)));
  }

  // Workout Logs
  async getWorkoutLogs(userId: string): Promise<schema.WorkoutLog[]> {
    return db.select().from(schema.workoutLogs)
      .where(eq(schema.workoutLogs.userId, userId));
  }

  async createWorkoutLog(userId: string, log: Omit<schema.WorkoutLog, 'id' | 'userId'>): Promise<schema.WorkoutLog> {
    const result = await db.insert(schema.workoutLogs).values({
      userId,
      ...log,
    }).returning();
    return result[0];
  }

  // Foods
  async getFoods(userId: string): Promise<schema.Food[]> {
    return db.select().from(schema.foods)
      .where(eq(schema.foods.userId, userId));
  }

  async getFood(id: string, userId: string): Promise<schema.Food | undefined> {
    const result = await db.select().from(schema.foods)
      .where(and(eq(schema.foods.id, id), eq(schema.foods.userId, userId)));
    return result[0];
  }

  async createFood(userId: string, food: Omit<schema.Food, 'id' | 'userId' | 'createdAt'>): Promise<schema.Food> {
    const result = await db.insert(schema.foods).values({
      userId,
      ...food,
    }).returning();
    return result[0];
  }

  async deleteFood(id: string, userId: string): Promise<void> {
    await db.delete(schema.foods)
      .where(and(eq(schema.foods.id, id), eq(schema.foods.userId, userId)));
  }

  // Food Entries
  async getFoodEntries(userId: string, date?: string): Promise<schema.FoodEntry[]> {
    if (date) {
      return db.select().from(schema.foodEntries)
        .where(and(eq(schema.foodEntries.userId, userId), eq(schema.foodEntries.date, date)));
    }
    return db.select().from(schema.foodEntries)
      .where(eq(schema.foodEntries.userId, userId));
  }

  async createFoodEntry(userId: string, entry: Omit<schema.FoodEntry, 'id' | 'userId' | 'createdAt'>): Promise<schema.FoodEntry> {
    const result = await db.insert(schema.foodEntries).values({
      userId,
      ...entry,
    }).returning();
    return result[0];
  }

  async deleteFoodEntry(id: string, userId: string): Promise<void> {
    await db.delete(schema.foodEntries)
      .where(and(eq(schema.foodEntries.id, id), eq(schema.foodEntries.userId, userId)));
  }

  // Weight Entries
  async getWeightEntries(userId: string): Promise<schema.WeightEntry[]> {
    return db.select().from(schema.weightEntries)
      .where(eq(schema.weightEntries.userId, userId));
  }

  async createWeightEntry(userId: string, entry: Omit<schema.WeightEntry, 'id' | 'userId' | 'createdAt'>): Promise<schema.WeightEntry> {
    const result = await db.insert(schema.weightEntries).values({
      userId,
      ...entry,
    }).returning();
    return result[0];
  }

  // Meals
  async getMeals(userId: string): Promise<schema.Meal[]> {
    return db.select().from(schema.meals)
      .where(eq(schema.meals.userId, userId));
  }

  async createMeal(userId: string, meal: Omit<schema.Meal, 'id' | 'userId' | 'createdAt'>): Promise<schema.Meal> {
    const result = await db.insert(schema.meals).values({
      userId,
      ...meal,
    }).returning();
    return result[0];
  }

  async deleteMeal(id: string, userId: string): Promise<void> {
    await db.delete(schema.meals)
      .where(and(eq(schema.meals.id, id), eq(schema.meals.userId, userId)));
  }
}

export const storage = new DatabaseStorage();
