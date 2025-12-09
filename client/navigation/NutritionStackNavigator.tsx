import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NutritionScreen from "@/screens/NutritionScreen";
import AddFoodScreen from "@/screens/AddFoodScreen";
import FoodDatabaseScreen from "@/screens/FoodDatabaseScreen";
import ScanNutritionScreen from "@/screens/ScanNutritionScreen";
import MealCreatorScreen from "@/screens/MealCreatorScreen";
import MyMealsScreen from "@/screens/MyMealsScreen";
import LogMealScreen from "@/screens/LogMealScreen";
import EditFoodScreen from "@/screens/EditFoodScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type NutritionStackParamList = {
  Nutrition: undefined;
  AddFood: { mealType?: string; foodId?: string } | undefined;
  FoodDatabase: undefined;
  ScanNutrition: undefined;
  MealCreator: { mealId?: string } | undefined;
  MyMeals: undefined;
  LogMeal: { mealType?: string } | undefined;
  EditFood: { foodId: string };
};

const Stack = createNativeStackNavigator<NutritionStackParamList>();

export default function NutritionStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Nutrition"
        component={NutritionScreen}
        options={{
          headerTitle: "Nutrition",
        }}
      />
      <Stack.Screen
        name="AddFood"
        component={AddFoodScreen}
        options={{
          headerTitle: "Add Food",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="FoodDatabase"
        component={FoodDatabaseScreen}
        options={{
          headerTitle: "My Foods",
        }}
      />
      <Stack.Screen
        name="ScanNutrition"
        component={ScanNutritionScreen}
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />
      <Stack.Screen
        name="MealCreator"
        component={MealCreatorScreen}
        options={{
          headerTitle: "Create Meal",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="MyMeals"
        component={MyMealsScreen}
        options={{
          headerTitle: "My Meals",
        }}
      />
      <Stack.Screen
        name="LogMeal"
        component={LogMealScreen}
        options={{
          headerTitle: "Log Meal",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="EditFood"
        component={EditFoodScreen}
        options={{
          headerTitle: "Edit Food",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}
