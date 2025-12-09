import React from "react";
import { View, ScrollView, StyleSheet, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/lib/store";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { WorkoutsStackParamList } from "@/navigation/WorkoutsStackNavigator";

type Navigation = NativeStackNavigationProp<WorkoutsStackParamList>;
type Route = RouteProp<WorkoutsStackParamList, "WorkoutDetail">;

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WorkoutDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { theme } = useTheme();
  const store = useStore();

  const workout = store.workouts.find((w) => w.id === route.params.workoutId);

  if (!workout) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.backgroundRoot, justifyContent: "center" },
        ]}
      >
        <ThemedText type="body" style={{ textAlign: "center" }}>
          Workout not found
        </ThemedText>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      "Delete Workout",
      `Are you sure you want to delete "${workout.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            store.deleteWorkout(workout.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing["3xl"],
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <View style={styles.header}>
          <View style={[styles.colorBadge, { backgroundColor: workout.color }]} />
          <View style={styles.headerContent}>
            <ThemedText type="h2">{workout.name}</ThemedText>
            <View style={styles.schedule}>
              <Feather name="calendar" size={14} color={theme.textSecondary} />
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary, marginLeft: 4 }}
              >
                {workout.scheduledDays.length > 0
                  ? workout.scheduledDays.map((d) => dayNames[d]).join(", ")
                  : "Not scheduled"}
              </ThemedText>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() =>
                navigation.navigate("CreateWorkout", { workoutId: workout.id })
              }
              style={[styles.iconButton, { backgroundColor: theme.backgroundDefault }]}
            >
              <Feather name="edit-2" size={18} color={theme.text} />
            </Pressable>
            <Pressable
              onPress={handleDelete}
              style={[styles.iconButton, { backgroundColor: theme.backgroundDefault }]}
            >
              <Feather name="trash-2" size={18} color={theme.error} />
            </Pressable>
          </View>
        </View>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Exercises ({workout.exercises.length})
        </ThemedText>

        {workout.exercises.map((exercise, index) => (
          <Card key={exercise.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseIndex}>
                <ThemedText type="small" style={{ color: "#FFF", fontWeight: "600" }}>
                  {index + 1}
                </ThemedText>
              </View>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {exercise.name}
              </ThemedText>
            </View>
            <View style={styles.exerciseStats}>
              <View style={styles.stat}>
                <ThemedText type="h4">{exercise.sets}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  sets
                </ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <ThemedText type="h4">{exercise.reps}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  reps
                </ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <ThemedText type="h4">{exercise.weight}</ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  lbs
                </ThemedText>
              </View>
            </View>
            {exercise.notes ? (
              <ThemedText
                type="small"
                style={[styles.notes, { color: theme.textSecondary }]}
              >
                {exercise.notes}
              </ThemedText>
            ) : null}
          </Card>
        ))}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { backgroundColor: theme.backgroundRoot, paddingBottom: insets.bottom + Spacing.lg },
        ]}
      >
        <Button
          onPress={() =>
            navigation.navigate("ActiveWorkout", { workoutId: workout.id })
          }
        >
          Start Workout
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.xl,
  },
  colorBadge: {
    width: 4,
    height: 50,
    borderRadius: 2,
    marginRight: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  schedule: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  exerciseCard: {
    marginBottom: Spacing.md,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  exerciseIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF6B35",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  exerciseStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E0E0E0",
  },
  notes: {
    marginTop: Spacing.md,
    fontStyle: "italic",
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
});
