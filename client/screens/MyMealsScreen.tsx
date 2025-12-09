import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/lib/store";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { NutritionStackParamList } from "@/navigation/NutritionStackNavigator";

type Navigation = NativeStackNavigationProp<NutritionStackParamList>;

export default function MyMealsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<Navigation>();
  const { theme } = useTheme();
  const store = useStore();

  const handleEditMeal = (mealId: string) => {
    navigation.navigate("MealCreator", { mealId });
  };

  const handleDeleteMeal = (mealId: string) => {
    store.deleteMeal(mealId);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        {store.meals.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="book-open" size={48} color={theme.textSecondary} />
            <ThemedText
              type="body"
              style={{ color: theme.textSecondary, marginTop: Spacing.md }}
            >
              No meal preps saved yet
            </ThemedText>
            <Button
              onPress={() => navigation.navigate("MealCreator")}
              style={{ marginTop: Spacing.xl }}
            >
              Create Your First Meal
            </Button>
          </View>
        ) : (
          store.meals.map((meal) => {
            const perServing = store.getMealNutritionPerServing(meal.id);

            return (
              <Card key={meal.id} style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <View style={styles.mealInfo}>
                    <ThemedText type="h4">{meal.name}</ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      {meal.totalServings} servings - {meal.ingredients.length} ingredients
                    </ThemedText>
                  </View>
                  <View style={styles.mealActions}>
                    <Pressable
                      onPress={() => handleEditMeal(meal.id)}
                      style={styles.iconButton}
                      hitSlop={8}
                    >
                      <Feather name="edit-2" size={18} color={theme.primary} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDeleteMeal(meal.id)}
                      style={styles.iconButton}
                      hitSlop={8}
                    >
                      <Feather name="trash-2" size={18} color={theme.error} />
                    </Pressable>
                  </View>
                </View>

                <View style={[styles.nutritionRow, { borderTopColor: theme.border }]}>
                  <View style={styles.nutritionItem}>
                    <ThemedText type="h4" style={{ color: theme.primary }}>
                      {Math.round(perServing.calories)}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      cal/serving
                    </ThemedText>
                  </View>
                  <View style={styles.nutritionItem}>
                    <ThemedText type="body" style={{ color: theme.protein }}>
                      {Math.round(perServing.protein)}g
                    </ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      protein
                    </ThemedText>
                  </View>
                  <View style={styles.nutritionItem}>
                    <ThemedText type="body" style={{ color: theme.carbs }}>
                      {Math.round(perServing.carbs)}g
                    </ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      carbs
                    </ThemedText>
                  </View>
                  <View style={styles.nutritionItem}>
                    <ThemedText type="body" style={{ color: theme.fats }}>
                      {Math.round(perServing.fats)}g
                    </ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      fats
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.ingredientsList}>
                  {meal.ingredients.slice(0, 3).map((ing) => (
                    <ThemedText
                      key={ing.id}
                      type="small"
                      style={{ color: theme.textSecondary }}
                    >
                      {ing.amount} {ing.unit} {ing.name}
                    </ThemedText>
                  ))}
                  {meal.ingredients.length > 3 ? (
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      +{meal.ingredients.length - 3} more...
                    </ThemedText>
                  ) : null}
                </View>
              </Card>
            );
          })
        )}

        {store.meals.length > 0 ? (
          <Pressable
            onPress={() => navigation.navigate("MealCreator")}
            style={[styles.secondaryButton, { borderColor: theme.primary }]}
          >
            <ThemedText type="body" style={{ color: theme.primary }}>
              Create New Meal
            </ThemedText>
          </Pressable>
        ) : null}
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
  empty: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  mealCard: {
    marginBottom: Spacing.lg,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  mealInfo: {
    flex: 1,
  },
  mealActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  nutritionItem: {
    alignItems: "center",
  },
  ingredientsList: {
    marginTop: Spacing.md,
  },
  secondaryButton: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
