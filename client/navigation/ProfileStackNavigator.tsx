import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "@/screens/ProfileScreen";
import GoalsScreen from "@/screens/GoalsScreen";
import BackupScreen from "@/screens/BackupScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type ProfileStackParamList = {
  Profile: undefined;
  Goals: undefined;
  Backup: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: "Profile",
        }}
      />
      <Stack.Screen
        name="Goals"
        component={GoalsScreen}
        options={{
          headerTitle: "Goals",
        }}
      />
      <Stack.Screen
        name="Backup"
        component={BackupScreen}
        options={{
          headerTitle: "Backup & Restore",
        }}
      />
    </Stack.Navigator>
  );
}
