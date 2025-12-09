import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WorkoutsScreen from "@/screens/WorkoutsScreen";
import CreateWorkoutScreen from "@/screens/CreateWorkoutScreen";
import WorkoutDetailScreen from "@/screens/WorkoutDetailScreen";
import ActiveWorkoutScreen from "@/screens/ActiveWorkoutScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type WorkoutsStackParamList = {
  Workouts: undefined;
  CreateWorkout: { workoutId?: string } | undefined;
  WorkoutDetail: { workoutId: string };
  ActiveWorkout: { workoutId: string };
};

const Stack = createNativeStackNavigator<WorkoutsStackParamList>();

export default function WorkoutsStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Workouts"
        component={WorkoutsScreen}
        options={{
          headerTitle: "Workouts",
        }}
      />
      <Stack.Screen
        name="CreateWorkout"
        component={CreateWorkoutScreen}
        options={{
          headerTitle: "Create Workout",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="WorkoutDetail"
        component={WorkoutDetailScreen}
        options={{
          headerTitle: "Workout",
        }}
      />
      <Stack.Screen
        name="ActiveWorkout"
        component={ActiveWorkoutScreen}
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />
    </Stack.Navigator>
  );
}
