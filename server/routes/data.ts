import { Router, Request, Response } from "express";
import { storage } from "../storage";

const router = Router();

// Middleware to get userId from session
async function getUserId(req: Request): Promise<string | null> {
  const sessionId = req.headers.authorization?.replace("Bearer ", "");
  if (!sessionId) return null;
  const session = await storage.getSession(sessionId);
  return session?.userId || null;
}

// Workouts
router.get("/workouts", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const workouts = await storage.getWorkouts(userId);
    res.json({ workouts });
  } catch (error) {
    console.error("Get workouts error:", error);
    res.status(500).json({ error: "Failed to get workouts" });
  }
});

router.post("/workouts", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const workout = await storage.createWorkout(userId, req.body);
    res.status(201).json({ workout });
  } catch (error) {
    console.error("Create workout error:", error);
    res.status(500).json({ error: "Failed to create workout" });
  }
});

router.put("/workouts/:id", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const workout = await storage.updateWorkout(req.params.id, userId, req.body);
    if (!workout) return res.status(404).json({ error: "Workout not found" });
    res.json({ workout });
  } catch (error) {
    console.error("Update workout error:", error);
    res.status(500).json({ error: "Failed to update workout" });
  }
});

router.delete("/workouts/:id", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    await storage.deleteWorkout(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete workout error:", error);
    res.status(500).json({ error: "Failed to delete workout" });
  }
});

// Workout Logs
router.get("/workout-logs", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const logs = await storage.getWorkoutLogs(userId);
    res.json({ logs });
  } catch (error) {
    console.error("Get workout logs error:", error);
    res.status(500).json({ error: "Failed to get workout logs" });
  }
});

router.post("/workout-logs", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const log = await storage.createWorkoutLog(userId, req.body);
    res.status(201).json({ log });
  } catch (error) {
    console.error("Create workout log error:", error);
    res.status(500).json({ error: "Failed to create workout log" });
  }
});

// Foods
router.get("/foods", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const foods = await storage.getFoods(userId);
    res.json({ foods });
  } catch (error) {
    console.error("Get foods error:", error);
    res.status(500).json({ error: "Failed to get foods" });
  }
});

router.post("/foods", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const food = await storage.createFood(userId, req.body);
    res.status(201).json({ food });
  } catch (error) {
    console.error("Create food error:", error);
    res.status(500).json({ error: "Failed to create food" });
  }
});

router.delete("/foods/:id", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    await storage.deleteFood(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete food error:", error);
    res.status(500).json({ error: "Failed to delete food" });
  }
});

// Food Entries
router.get("/food-entries", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const date = req.query.date as string | undefined;
    const entries = await storage.getFoodEntries(userId, date);
    res.json({ entries });
  } catch (error) {
    console.error("Get food entries error:", error);
    res.status(500).json({ error: "Failed to get food entries" });
  }
});

router.post("/food-entries", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const entry = await storage.createFoodEntry(userId, req.body);
    res.status(201).json({ entry });
  } catch (error) {
    console.error("Create food entry error:", error);
    res.status(500).json({ error: "Failed to create food entry" });
  }
});

router.delete("/food-entries/:id", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    await storage.deleteFoodEntry(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete food entry error:", error);
    res.status(500).json({ error: "Failed to delete food entry" });
  }
});

// Weight Entries
router.get("/weight-entries", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const entries = await storage.getWeightEntries(userId);
    res.json({ entries });
  } catch (error) {
    console.error("Get weight entries error:", error);
    res.status(500).json({ error: "Failed to get weight entries" });
  }
});

router.post("/weight-entries", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const entry = await storage.createWeightEntry(userId, req.body);
    res.status(201).json({ entry });
  } catch (error) {
    console.error("Create weight entry error:", error);
    res.status(500).json({ error: "Failed to create weight entry" });
  }
});

// Meals
router.get("/meals", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const meals = await storage.getMeals(userId);
    res.json({ meals });
  } catch (error) {
    console.error("Get meals error:", error);
    res.status(500).json({ error: "Failed to get meals" });
  }
});

router.post("/meals", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const meal = await storage.createMeal(userId, req.body);
    res.status(201).json({ meal });
  } catch (error) {
    console.error("Create meal error:", error);
    res.status(500).json({ error: "Failed to create meal" });
  }
});

router.delete("/meals/:id", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    await storage.deleteMeal(req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete meal error:", error);
    res.status(500).json({ error: "Failed to delete meal" });
  }
});

export default router;
