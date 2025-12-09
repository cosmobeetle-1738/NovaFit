import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { Workout } from "@/lib/store";

interface ScheduleGridProps {
  workouts: Workout[];
  onDayPress: (dayIndex: number) => void;
  onWorkoutPress: (workout: Workout) => void;
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ScheduleGrid({
  workouts,
  onDayPress,
  onWorkoutPress,
}: ScheduleGridProps) {
  const { theme } = useTheme();
  const today = new Date().getDay();

  const getWorkoutForDay = (dayIndex: number) => {
    return workouts.find((w) => w.scheduledDays.includes(dayIndex));
  };

  return (
    <View style={styles.container}>
      {dayNames.map((day, index) => {
        const workout = getWorkoutForDay(index);
        const isToday = index === today;

        return (
          <View key={day} style={styles.dayColumn}>
            <View
              style={[
                styles.dayHeader,
                isToday && { backgroundColor: theme.primary },
              ]}
            >
              <ThemedText
                type="small"
                style={[
                  styles.dayText,
                  { color: isToday ? "#FFF" : theme.textSecondary },
                ]}
              >
                {day}
              </ThemedText>
            </View>
            <Pressable
              onPress={() =>
                workout ? onWorkoutPress(workout) : onDayPress(index)
              }
              style={[
                styles.dayContent,
                { backgroundColor: theme.backgroundDefault },
              ]}
            >
              {workout ? (
                <View
                  style={[
                    styles.workoutIndicator,
                    { backgroundColor: workout.color },
                  ]}
                >
                  <ThemedText
                    type="small"
                    style={styles.workoutName}
                    numberOfLines={2}
                  >
                    {workout.name}
                  </ThemedText>
                </View>
              ) : (
                <Feather name="plus" size={16} color={theme.textSecondary} />
              )}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  dayColumn: {
    flex: 1,
  },
  dayHeader: {
    alignItems: "center",
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  dayText: {
    fontWeight: "600",
    fontSize: 11,
  },
  dayContent: {
    height: 60,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xs,
  },
  workoutIndicator: {
    width: "100%",
    height: "100%",
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
    padding: 2,
  },
  workoutName: {
    color: "#FFF",
    fontSize: 9,
    textAlign: "center",
    fontWeight: "600",
  },
});
