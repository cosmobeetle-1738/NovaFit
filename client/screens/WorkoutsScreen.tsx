import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { WorkoutCard } from "@/components/WorkoutCard";
import { ScheduleGrid } from "@/components/ScheduleGrid";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/lib/store";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { WorkoutsStackParamList } from "@/navigation/WorkoutsStackNavigator";

type WorkoutsNavigation = NativeStackNavigationProp<WorkoutsStackParamList>;

export default function WorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<WorkoutsNavigation>();
  const { theme } = useTheme();
  const store = useStore();
  const [activeTab, setActiveTab] = useState<"library" | "schedule">("library");

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <View style={styles.header}>
          <View style={[styles.segmentedControl, { backgroundColor: theme.backgroundDefault }]}>
            <Pressable
              onPress={() => setActiveTab("library")}
              style={[
                styles.segment,
                activeTab === "library" && {
                  backgroundColor: theme.backgroundRoot,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  fontWeight: activeTab === "library" ? "600" : "400",
                  color: activeTab === "library" ? theme.text : theme.textSecondary,
                }}
              >
                Library
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("schedule")}
              style={[
                styles.segment,
                activeTab === "schedule" && {
                  backgroundColor: theme.backgroundRoot,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  fontWeight: activeTab === "schedule" ? "600" : "400",
                  color: activeTab === "schedule" ? theme.text : theme.textSecondary,
                }}
              >
                Schedule
              </ThemedText>
            </Pressable>
          </View>
          <Pressable
            onPress={() => navigation.navigate("CreateWorkout")}
            style={[styles.addButton, { backgroundColor: theme.primary }]}
          >
            <Feather name="plus" size={20} color="#FFF" />
          </Pressable>
        </View>

        {activeTab === "library" ? (
          <View style={styles.library}>
            {store.workouts.length === 0 ? (
              <View style={styles.empty}>
                <Feather name="activity" size={48} color={theme.textSecondary} />
                <ThemedText
                  type="body"
                  style={{ color: theme.textSecondary, marginTop: Spacing.md }}
                >
                  No workouts yet
                </ThemedText>
                <Pressable
                  onPress={() => navigation.navigate("CreateWorkout")}
                  style={[styles.createButton, { borderColor: theme.primary }]}
                >
                  <ThemedText type="body" style={{ color: theme.primary }}>
                    Create your first workout
                  </ThemedText>
                </Pressable>
              </View>
            ) : (
              store.workouts.map((workout) => (
                <View key={workout.id} style={styles.cardWrapper}>
                  <WorkoutCard
                    workout={workout}
                    onPress={() =>
                      navigation.navigate("WorkoutDetail", { workoutId: workout.id })
                    }
                    onStart={() =>
                      navigation.navigate("ActiveWorkout", { workoutId: workout.id })
                    }
                  />
                </View>
              ))
            )}
          </View>
        ) : (
          <View style={styles.schedule}>
            <ThemedText type="h4" style={styles.scheduleTitle}>
              Weekly Schedule
            </ThemedText>
            <ScheduleGrid
              workouts={store.workouts}
              onDayPress={(day) => navigation.navigate("CreateWorkout")}
              onWorkoutPress={(workout) =>
                navigation.navigate("WorkoutDetail", { workoutId: workout.id })
              }
            />
            <View style={styles.legend}>
              {store.workouts.map((workout) => (
                <View key={workout.id} style={styles.legendItem}>
                  <View
                    style={[styles.legendColor, { backgroundColor: workout.color }]}
                  />
                  <ThemedText type="small">{workout.name}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
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
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  segmentedControl: {
    flex: 1,
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    padding: 4,
    marginRight: Spacing.md,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: BorderRadius.sm,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  library: {},
  cardWrapper: {
    marginBottom: Spacing.md,
  },
  empty: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
  createButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderWidth: 1,
    borderRadius: BorderRadius.full,
  },
  schedule: {},
  scheduleTitle: {
    marginBottom: Spacing.lg,
  },
  legend: {
    marginTop: Spacing.xl,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.xs,
  },
});
