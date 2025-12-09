import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { StatCard } from "@/components/StatCard";
import { MacroDisplay } from "@/components/MacroDisplay";
import { WeeklyChart } from "@/components/WeeklyChart";
import { FAB } from "@/components/FAB";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Spacing, BorderRadius } from "@/constants/theme";

type RootNavigation = NativeStackNavigationProp<any>;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<RootNavigation>();
  const { theme } = useTheme();
  const store = useStore();
  const { user } = useAuth();

  const today = new Date().toISOString().split("T")[0];
  const dailyNutrition = store.getDailyNutrition(today);
  const weeklyWorkouts = store.getWeeklyWorkouts();
  const latestWeight = store.weightEntries[store.weightEntries.length - 1];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
  const weekData = dayNames.map((day, index) => {
    const hasWorkout = weeklyWorkouts.some((log) => {
      const logDay = new Date(log.completedAt).getDay();
      return logDay === index;
    });
    return {
      day,
      value: hasWorkout ? 1 : 0,
      completed: hasWorkout,
    };
  });

  const fabActions = [
    {
      icon: "activity" as const,
      label: "Log Workout",
      onPress: () =>
        navigation.navigate("WorkoutsTab", { screen: "Workouts" }),
    },
    {
      icon: "coffee" as const,
      label: "Add Food",
      onPress: () =>
        navigation.navigate("NutritionTab", {
          screen: "AddFood",
          params: { mealType: "snack" },
        }),
    },
    {
      icon: "trending-down" as const,
      label: "Log Weight",
      onPress: () =>
        navigation.navigate("ProfileTab", { screen: "Goals" }),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing["5xl"],
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <View style={styles.greeting}>
          <ThemedText type="h2">
            {getGreeting()}, {user?.name || "there"}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </ThemedText>
        </View>

        <Card style={styles.nutritionCard}>
          <View style={styles.nutritionHeader}>
            <ThemedText type="h4">Today's Nutrition</ThemedText>
            <View style={styles.caloriesBadge}>
              <ThemedText type="h3" style={{ color: theme.primary }}>
                {Math.round(dailyNutrition.calories)}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                /{store.profile.goals.dailyCalories} cal
              </ThemedText>
            </View>
          </View>
          <View style={styles.macros}>
            <MacroDisplay
              label="Protein"
              current={dailyNutrition.protein}
              goal={store.profile.goals.dailyProtein}
              color={theme.protein}
            />
            <View style={styles.macroSpacer} />
            <MacroDisplay
              label="Carbs"
              current={dailyNutrition.carbs}
              goal={store.profile.goals.dailyCarbs}
              color={theme.carbs}
            />
            <View style={styles.macroSpacer} />
            <MacroDisplay
              label="Fats"
              current={dailyNutrition.fats}
              goal={store.profile.goals.dailyFats}
              color={theme.fats}
            />
          </View>
        </Card>

        <View style={styles.statsRow}>
          <StatCard
            icon="activity"
            label="Weekly Workouts"
            value={weeklyWorkouts.length}
            subtitle={`of ${store.profile.goals.weeklyWorkouts} goal`}
            color={theme.success}
          />
          <View style={styles.statSpacer} />
          <StatCard
            icon="trending-down"
            label="Current Weight"
            value={latestWeight ? `${latestWeight.weight}` : "--"}
            subtitle={store.profile.units === "imperial" ? "lbs" : "kg"}
            color={theme.info}
          />
        </View>

        <Card style={styles.chartCard}>
          <ThemedText type="h4">Weekly Activity</ThemedText>
          <WeeklyChart data={weekData} maxValue={1} color={theme.success} />
        </Card>

        {weeklyWorkouts.length > 0 ? (
          <View style={styles.recentSection}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Recent Activity
            </ThemedText>
            {weeklyWorkouts.slice(0, 3).map((log) => (
              <Card key={log.id} style={styles.activityCard}>
                <View style={styles.activityRow}>
                  <View
                    style={[
                      styles.activityIcon,
                      { backgroundColor: `${theme.success}20` },
                    ]}
                  >
                    <Feather name="check" size={16} color={theme.success} />
                  </View>
                  <View style={styles.activityContent}>
                    <ThemedText type="body">{log.workoutName}</ThemedText>
                    <ThemedText
                      type="small"
                      style={{ color: theme.textSecondary }}
                    >
                      {new Date(log.completedAt).toLocaleDateString()} - {log.duration} min
                    </ThemedText>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <FAB actions={fabActions} />
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
  greeting: {
    marginBottom: Spacing.xl,
  },
  nutritionCard: {
    marginBottom: Spacing.lg,
  },
  nutritionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  caloriesBadge: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  macros: {
    flexDirection: "row",
  },
  macroSpacer: {
    width: Spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
  },
  statSpacer: {
    width: Spacing.md,
  },
  chartCard: {
    marginBottom: Spacing.lg,
  },
  recentSection: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  activityCard: {
    marginBottom: Spacing.sm,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  activityContent: {
    flex: 1,
  },
});
