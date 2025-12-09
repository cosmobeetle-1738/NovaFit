import { useState, useCallback } from "react";

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  isBodyweight?: boolean;
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
  scheduledDays: number[];
  color: string;
  createdAt: Date;
}

export interface WorkoutLog {
  id: string;
  workoutId: string;
  workoutName: string;
  completedAt: Date;
  duration: number;
  exerciseLogs: ExerciseLog[];
  notes?: string;
}

export interface ExerciseLog {
  exerciseId: string;
  name: string;
  sets: SetLog[];
  isBodyweight?: boolean;
}

export interface SetLog {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface Food {
  id: string;
  name: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  isSaved: boolean;
  createdAt: Date;
}

export interface FoodEntry {
  id: string;
  foodId: string;
  food: Food;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  servings: number;
  date: string;
  createdAt: Date;
}

export interface UserProfile {
  name: string;
  avatar: "mercury" | "venus" | "earth" | "mars" | "jupiter" | "saturn" | "uranus" | "neptune";
  units: "metric" | "imperial";
  goals: {
    dailyCalories: number;
    dailyProtein: number;
    dailyCarbs: number;
    dailyFats: number;
    weeklyWorkouts: number;
    targetWeight: number;
  };
}

export interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  createdAt: Date;
}

export interface MealIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

export interface Meal {
  id: string;
  name: string;
  ingredients: MealIngredient[];
  totalServings: number;
  createdAt: Date;
}

export interface MealNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const calculateMealTotals = (ingredients: MealIngredient[]): MealNutrition => {
  return ingredients.reduce(
    (acc, ing) => ({
      calories: acc.calories + ing.calories,
      protein: acc.protein + ing.protein,
      carbs: acc.carbs + ing.carbs,
      fats: acc.fats + ing.fats,
      fiber: acc.fiber + ing.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
  );
};

const calculatePerServing = (totals: MealNutrition, servings: number): MealNutrition => {
  if (servings <= 0) return totals;
  return {
    calories: totals.calories / servings,
    protein: totals.protein / servings,
    carbs: totals.carbs / servings,
    fats: totals.fats / servings,
    fiber: totals.fiber / servings,
  };
};

const defaultWorkouts: Workout[] = [];

const defaultFoods: Food[] = [];

const defaultFoodEntries: FoodEntry[] = [];

const defaultWorkoutLogs: WorkoutLog[] = [];

const defaultProfile: UserProfile = {
  name: "",
  avatar: "earth",
  units: "imperial",
  goals: {
    dailyCalories: 0,
    dailyProtein: 0,
    dailyCarbs: 0,
    dailyFats: 0,
    weeklyWorkouts: 0,
    targetWeight: 0,
  },
};

const defaultWeightEntries: WeightEntry[] = [];

const defaultMeals: Meal[] = [];

let workouts = [...defaultWorkouts];
let foods = [...defaultFoods];
let foodEntries = [...defaultFoodEntries];
let workoutLogs = [...defaultWorkoutLogs];
let profile = { ...defaultProfile };
let weightEntries = [...defaultWeightEntries];
let meals = [...defaultMeals];

export const useStore = () => {
  const [, forceUpdate] = useState({});
  const refresh = useCallback(() => forceUpdate({}), []);

  return {
    workouts,
    foods,
    foodEntries,
    workoutLogs,
    profile,
    weightEntries,
    meals,

    addWorkout: (workout: Omit<Workout, "id" | "createdAt">) => {
      const newWorkout = { ...workout, id: generateId(), createdAt: new Date() };
      workouts = [...workouts, newWorkout];
      refresh();
      return newWorkout;
    },

    updateWorkout: (id: string, updates: Partial<Workout>) => {
      workouts = workouts.map((w) => (w.id === id ? { ...w, ...updates } : w));
      refresh();
    },

    deleteWorkout: (id: string) => {
      workouts = workouts.filter((w) => w.id !== id);
      refresh();
    },

    addFood: (food: Omit<Food, "id" | "createdAt">) => {
      const newFood = { ...food, id: generateId(), createdAt: new Date() };
      foods = [...foods, newFood];
      refresh();
      return newFood;
    },

    updateFood: (id: string, updates: Partial<Food>) => {
      foods = foods.map((f) => (f.id === id ? { ...f, ...updates } : f));
      refresh();
    },

    deleteFood: (id: string) => {
      foods = foods.filter((f) => f.id !== id);
      refresh();
    },

    addFoodEntry: (entry: Omit<FoodEntry, "id" | "createdAt">) => {
      const newEntry = { ...entry, id: generateId(), createdAt: new Date() };
      foodEntries = [...foodEntries, newEntry];
      refresh();
      return newEntry;
    },

    deleteFoodEntry: (id: string) => {
      foodEntries = foodEntries.filter((e) => e.id !== id);
      refresh();
    },

    addWorkoutLog: (log: Omit<WorkoutLog, "id">) => {
      const newLog = { ...log, id: generateId() };
      workoutLogs = [...workoutLogs, newLog];
      refresh();
      return newLog;
    },

    updateProfile: (updates: Partial<UserProfile>) => {
      profile = { ...profile, ...updates };
      refresh();
    },

    addWeightEntry: (weight: number, date: string) => {
      const existingIndex = weightEntries.findIndex((e) => e.date === date);
      if (existingIndex >= 0) {
        weightEntries = weightEntries.map((e, i) =>
          i === existingIndex ? { ...e, weight } : e
        );
      } else {
        weightEntries = [
          ...weightEntries,
          { id: generateId(), weight, date, createdAt: new Date() },
        ].sort((a, b) => a.date.localeCompare(b.date));
      }
      refresh();
    },

    getFoodEntriesForDate: (date: string) => {
      return foodEntries.filter((e) => e.date === date);
    },

    getDailyNutrition: (date: string) => {
      const entries = foodEntries.filter((e) => e.date === date);
      return entries.reduce(
        (acc, entry) => ({
          calories: acc.calories + entry.food.calories * entry.servings,
          protein: acc.protein + entry.food.protein * entry.servings,
          carbs: acc.carbs + entry.food.carbs * entry.servings,
          fats: acc.fats + entry.food.fats * entry.servings,
          fiber: acc.fiber + entry.food.fiber * entry.servings,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
      );
    },

    getWeeklyWorkouts: () => {
      const weekAgo = new Date(Date.now() - 7 * 86400000);
      return workoutLogs.filter((log) => new Date(log.completedAt) >= weekAgo);
    },

    getWorkoutForDay: (dayOfWeek: number) => {
      return workouts.find((w) => w.scheduledDays.includes(dayOfWeek));
    },

    addMeal: (meal: Omit<Meal, "id" | "createdAt">) => {
      const newMeal = { ...meal, id: generateId(), createdAt: new Date() };
      meals = [...meals, newMeal];
      refresh();
      return newMeal;
    },

    updateMeal: (id: string, updates: Partial<Meal>) => {
      meals = meals.map((m) => (m.id === id ? { ...m, ...updates } : m));
      refresh();
    },

    deleteMeal: (id: string) => {
      meals = meals.filter((m) => m.id !== id);
      refresh();
    },

    getMealById: (id: string) => {
      return meals.find((m) => m.id === id);
    },

    getMealNutrition: (mealId: string): MealNutrition => {
      const meal = meals.find((m) => m.id === mealId);
      if (!meal) return { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };
      return calculateMealTotals(meal.ingredients);
    },

    getMealNutritionPerServing: (mealId: string): MealNutrition => {
      const meal = meals.find((m) => m.id === mealId);
      if (!meal) return { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };
      const totals = calculateMealTotals(meal.ingredients);
      return calculatePerServing(totals, meal.totalServings);
    },

    logMealAsFood: (
      mealId: string,
      servingsEaten: number,
      mealType: "breakfast" | "lunch" | "dinner" | "snack",
      date: string
    ) => {
      const meal = meals.find((m) => m.id === mealId);
      if (!meal) return null;

      const perServing = calculatePerServing(
        calculateMealTotals(meal.ingredients),
        meal.totalServings
      );

      const food: Food = {
        id: generateId(),
        name: meal.name,
        servingSize: `1 serving (of ${meal.totalServings})`,
        calories: perServing.calories,
        protein: perServing.protein,
        carbs: perServing.carbs,
        fats: perServing.fats,
        fiber: perServing.fiber,
        isSaved: false,
        createdAt: new Date(),
      };

      const entry: FoodEntry = {
        id: generateId(),
        foodId: food.id,
        food: { ...food },
        mealType,
        servings: servingsEaten,
        date,
        createdAt: new Date(),
      };

      foodEntries = [...foodEntries, entry];
      refresh();
      return entry;
    },

    refresh,
  };
};
