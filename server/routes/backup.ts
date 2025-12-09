import { Router, Request, Response } from "express";
import { storage } from "../storage";

const router = Router();

async function getUserId(req: Request): Promise<string | null> {
  const sessionId = req.headers.authorization?.replace("Bearer ", "");
  if (!sessionId) return null;
  const session = await storage.getSession(sessionId);
  return session?.userId || null;
}

router.get("/export", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await storage.getUser(userId);
    const userGoals = await storage.getUserGoals(userId);
    const workouts = await storage.getWorkouts(userId);
    const workoutLogs = await storage.getWorkoutLogs(userId);
    const foods = await storage.getFoods(userId);
    const foodEntries = await storage.getFoodEntries(userId);
    const weightEntries = await storage.getWeightEntries(userId);
    const meals = await storage.getMeals(userId);

    const backup = {
      version: 2,
      exportedAt: new Date().toISOString(),
      profile: user ? {
        name: user.name,
        avatar: user.avatar,
        units: user.units,
      } : null,
      goals: userGoals ? {
        dailyCalories: userGoals.dailyCalories,
        dailyProtein: userGoals.dailyProtein,
        dailyCarbs: userGoals.dailyCarbs,
        dailyFats: userGoals.dailyFats,
        weeklyWorkouts: userGoals.weeklyWorkouts,
        targetWeight: userGoals.targetWeight,
      } : null,
      workouts: workouts.map(w => ({
        exportId: w.id,
        name: w.name,
        exercises: w.exercises,
        scheduledDays: w.scheduledDays,
        color: w.color,
        createdAt: w.createdAt,
      })),
      workoutLogs: workoutLogs.map(l => {
        const workout = workouts.find(w => w.id === l.workoutId);
        return {
          workoutExportId: l.workoutId,
          workoutName: l.workoutName,
          completedAt: l.completedAt,
          duration: l.duration,
          exerciseLogs: l.exerciseLogs,
          notes: l.notes,
        };
      }),
      foods: foods.map(f => ({
        exportId: f.id,
        name: f.name,
        servingSize: f.servingSize,
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fats: f.fats,
        fiber: f.fiber,
        isSaved: f.isSaved,
        createdAt: f.createdAt,
      })),
      foodEntries: foodEntries.map(e => {
        const food = foods.find(f => f.id === e.foodId);
        return {
          foodExportId: e.foodId,
          mealType: e.mealType,
          servings: e.servings,
          date: e.date,
          foodSnapshot: food ? {
            name: food.name,
            servingSize: food.servingSize,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fats: food.fats,
            fiber: food.fiber,
          } : null,
        };
      }),
      weightEntries: weightEntries.map(w => ({
        weight: w.weight,
        date: w.date,
        createdAt: w.createdAt,
      })),
      meals: meals.map(m => ({
        exportId: m.id,
        name: m.name,
        ingredients: m.ingredients,
        totalServings: m.totalServings,
        createdAt: m.createdAt,
      })),
    };

    res.json({ success: true, backup });
  } catch (error) {
    console.error("Export backup error:", error);
    res.status(500).json({ error: "Failed to export backup" });
  }
});

router.post("/import", async (req: Request, res: Response) => {
  try {
    const userId = await getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { backup } = req.body;
    if (!backup || !backup.version) {
      return res.status(400).json({ error: "Invalid backup format" });
    }

    const importedCounts = {
      workouts: 0,
      workoutLogs: 0,
      foods: 0,
      foodEntries: 0,
      weightEntries: 0,
      meals: 0,
    };

    if (backup.profile) {
      await storage.updateUser(userId, {
        name: backup.profile.name,
        avatar: backup.profile.avatar,
        units: backup.profile.units,
      });
    }

    if (backup.goals) {
      await storage.upsertUserGoals(userId, backup.goals);
    }

    const workoutIdMap = new Map<string, string>();
    const foodIdMap = new Map<string, string>();

    const existingFoods = await storage.getFoods(userId);
    const existingWorkouts = await storage.getWorkouts(userId);

    if (backup.foods && Array.isArray(backup.foods)) {
      for (const food of backup.foods) {
        const existingFood = existingFoods.find(
          f => f.name === food.name && 
               f.servingSize === food.servingSize &&
               f.calories === food.calories
        );
        
        if (existingFood) {
          if (food.exportId) {
            foodIdMap.set(food.exportId, existingFood.id);
          }
        } else {
          const created = await storage.createFood(userId, {
            name: food.name,
            servingSize: food.servingSize,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fats: food.fats,
            fiber: food.fiber || 0,
            isSaved: food.isSaved ?? true,
          });
          if (food.exportId) {
            foodIdMap.set(food.exportId, created.id);
          }
          importedCounts.foods++;
        }
      }
    }

    if (backup.workouts && Array.isArray(backup.workouts)) {
      for (const workout of backup.workouts) {
        const existingWorkout = existingWorkouts.find(
          w => w.name === workout.name
        );
        
        if (existingWorkout) {
          if (workout.exportId) {
            workoutIdMap.set(workout.exportId, existingWorkout.id);
          }
        } else {
          const created = await storage.createWorkout(userId, {
            name: workout.name,
            exercises: workout.exercises || [],
            scheduledDays: workout.scheduledDays || [],
            color: workout.color || "#7B68EE",
          });
          if (workout.exportId) {
            workoutIdMap.set(workout.exportId, created.id);
          }
          importedCounts.workouts++;
        }
      }
    }

    if (backup.workoutLogs && Array.isArray(backup.workoutLogs)) {
      for (const log of backup.workoutLogs) {
        const newWorkoutId = log.workoutExportId 
          ? workoutIdMap.get(log.workoutExportId) || ""
          : "";
        
        await storage.createWorkoutLog(userId, {
          workoutId: newWorkoutId,
          workoutName: log.workoutName,
          completedAt: new Date(log.completedAt),
          duration: log.duration || 0,
          exerciseLogs: log.exerciseLogs || [],
          notes: log.notes,
        });
        importedCounts.workoutLogs++;
      }
    }

    if (backup.foodEntries && Array.isArray(backup.foodEntries)) {
      for (const entry of backup.foodEntries) {
        let foodId = entry.foodExportId 
          ? foodIdMap.get(entry.foodExportId) 
          : null;
        
        if (!foodId && entry.foodSnapshot) {
          const existingFood = existingFoods.find(
            f => f.name === entry.foodSnapshot.name &&
                 f.servingSize === entry.foodSnapshot.servingSize
          );
          
          if (existingFood) {
            foodId = existingFood.id;
          } else {
            const created = await storage.createFood(userId, {
              name: entry.foodSnapshot.name,
              servingSize: entry.foodSnapshot.servingSize,
              calories: entry.foodSnapshot.calories,
              protein: entry.foodSnapshot.protein,
              carbs: entry.foodSnapshot.carbs,
              fats: entry.foodSnapshot.fats,
              fiber: entry.foodSnapshot.fiber || 0,
              isSaved: false,
            });
            foodId = created.id;
          }
        }
        
        if (foodId) {
          await storage.createFoodEntry(userId, {
            foodId,
            mealType: entry.mealType,
            servings: entry.servings || 1,
            date: entry.date,
          });
          importedCounts.foodEntries++;
        }
      }
    }

    if (backup.weightEntries && Array.isArray(backup.weightEntries)) {
      for (const entry of backup.weightEntries) {
        await storage.createWeightEntry(userId, {
          weight: entry.weight,
          date: entry.date,
        });
        importedCounts.weightEntries++;
      }
    }

    if (backup.meals && Array.isArray(backup.meals)) {
      for (const meal of backup.meals) {
        const existingMeal = (await storage.getMeals(userId)).find(
          m => m.name === meal.name
        );
        
        if (!existingMeal) {
          await storage.createMeal(userId, {
            name: meal.name,
            ingredients: meal.ingredients || [],
            totalServings: meal.totalServings || 1,
          });
          importedCounts.meals++;
        }
      }
    }

    res.json({
      success: true,
      message: "Backup imported successfully",
      imported: importedCounts,
    });
  } catch (error) {
    console.error("Import backup error:", error);
    res.status(500).json({ error: "Failed to import backup" });
  }
});

export default router;
