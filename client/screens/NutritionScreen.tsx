import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { MacroDisplay } from "@/components/MacroDisplay";
import { MealSection } from "@/components/MealSection";
import { FAB } from "@/components/FAB";
import { CircularProgress } from "@/components/CircularProgress";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/lib/store";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { NutritionStackParamList } from "@/navigation/NutritionStackNavigator";

type NutritionNavigation = NativeStackNavigationProp<NutritionStackParamList>;

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NutritionNavigation>();
  const { theme } = useTheme();
  const store = useStore();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const dailyNutrition = store.getDailyNutrition(selectedDate);
  const dayEntries = store.getFoodEntriesForDate(selectedDate);

  const getEntriesByMeal = (mealType: string) =>
    dayEntries.filter((e) => e.mealType === mealType);

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    if (dateStr === today) return "Today";
    if (dateStr === yesterday) return "Yesterday";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const fabActions = [
    {
      icon: "camera" as const,
      label: "Scan Label",
      onPress: () => navigation.navigate("ScanNutrition"),
    },
    {
      icon: "edit-2" as const,
      label: "Add Manually",
      onPress: () => navigation.navigate("AddFood"),
    },
    {
      icon: "book-open" as const,
      label: "Log Meal Prep",
      onPress: () => navigation.navigate("LogMeal"),
    },
    {
      icon: "plus-circle" as const,
      label: "Create Meal",
      onPress: () => navigation.navigate("MealCreator"),
    },
    {
      icon: "database" as const,
      label: "My Foods",
      onPress: () => navigation.navigate("FoodDatabase"),
    },
    {
      icon: "book" as const,
      label: "My Meals",
      onPress: () => navigation.navigate("MyMeals"),
    },
  ];

  const caloriesProgress =
    store.profile.goals.dailyCalories > 0
      ? dailyNutrition.calories / store.profile.goals.dailyCalories
      : 0;

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
        <View style={styles.dateNav}>
          <Pressable
            onPress={() => changeDate(-1)}
            style={[styles.dateButton, { backgroundColor: theme.backgroundDefault }]}
          >
            <Feather name="chevron-left" size={20} color={theme.text} />
          </Pressable>
          <ThemedText type="h4">{formatDate(selectedDate)}</ThemedText>
          <Pressable
            onPress={() => changeDate(1)}
            style={[styles.dateButton, { backgroundColor: theme.backgroundDefault }]}
          >
            <Feather name="chevron-right" size={20} color={theme.text} />
          </Pressable>
        </View>

        <Card style={styles.summaryCard}>
          <View style={styles.caloriesHeader}>
            <View>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Calories
              </ThemedText>
              <View style={styles.caloriesValue}>
                <ThemedText type="h1" style={{ color: theme.primary }}>
                  {Math.round(dailyNutrition.calories)}
                </ThemedText>
                <ThemedText type="body" style={{ color: theme.textSecondary }}>
                  /{store.profile.goals.dailyCalories}
                </ThemedText>
              </View>
            </View>
            <CircularProgress
              progress={caloriesProgress}
              size={80}
              strokeWidth={8}
              color={theme.primary}
              showPercentage={true}
            />
          </View>
          <View style={styles.macrosRow}>
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

        <MealSection
          title="Breakfast"
          entries={getEntriesByMeal("breakfast")}
          onAddFood={() =>
            navigation.navigate("AddFood", { mealType: "breakfast" })
          }
          onDeleteEntry={(id) => store.deleteFoodEntry(id)}
        />
        <MealSection
          title="Lunch"
          entries={getEntriesByMeal("lunch")}
          onAddFood={() => navigation.navigate("AddFood", { mealType: "lunch" })}
          onDeleteEntry={(id) => store.deleteFoodEntry(id)}
        />
        <MealSection
          title="Dinner"
          entries={getEntriesByMeal("dinner")}
          onAddFood={() =>
            navigation.navigate("AddFood", { mealType: "dinner" })
          }
          onDeleteEntry={(id) => store.deleteFoodEntry(id)}
        />
        <MealSection
          title="Snacks"
          entries={getEntriesByMeal("snack")}
          onAddFood={() => navigation.navigate("AddFood", { mealType: "snack" })}
          onDeleteEntry={(id) => store.deleteFoodEntry(id)}
        />
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
  dateNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  dateButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCard: {
    marginBottom: Spacing.xl,
  },
  caloriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  caloriesValue: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  macrosRow: {
    flexDirection: "row",
  },
  macroSpacer: {
    width: Spacing.lg,
  },
});
