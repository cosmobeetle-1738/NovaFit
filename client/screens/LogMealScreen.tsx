import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TextInput, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useStore, Meal } from "@/lib/store";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { NutritionStackParamList } from "@/navigation/NutritionStackNavigator";

type Navigation = NativeStackNavigationProp<NutritionStackParamList>;
type Route = RouteProp<NutritionStackParamList, "LogMeal">;

export default function LogMealScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { theme } = useTheme();
  const store = useStore();

  const initialMealType = (route.params?.mealType as "breakfast" | "lunch" | "dinner" | "snack") || "snack";
  const today = new Date().toISOString().split("T")[0];

  const [selectedMealType, setSelectedMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">(initialMealType);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [servingsToLog, setServingsToLog] = useState("1");

  const mealTypeOptions: Array<"breakfast" | "lunch" | "dinner" | "snack"> = ["breakfast", "lunch", "dinner", "snack"];

  const handleSelectMeal = (meal: Meal) => {
    setSelectedMeal(meal);
    setServingsToLog("1");
  };

  const handleLogMeal = () => {
    if (!selectedMeal) return;

    store.logMealAsFood(
      selectedMeal.id,
      parseFloat(servingsToLog) || 1,
      selectedMealType,
      today
    );

    navigation.goBack();
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
        <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>
          Select which meal to add to:
        </ThemedText>

        <View style={styles.mealTypeSelector}>
          {mealTypeOptions.map((type) => (
            <Pressable
              key={type}
              onPress={() => setSelectedMealType(type)}
              style={[
                styles.mealTypeButton,
                {
                  backgroundColor: selectedMealType === type ? theme.primary : theme.backgroundDefault,
                  borderColor: selectedMealType === type ? theme.primary : theme.border,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  color: selectedMealType === type ? "#FFF" : theme.text,
                  fontWeight: selectedMealType === type ? "600" : "400",
                }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
          Select a meal prep to log:
        </ThemedText>

        {store.meals.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="book-open" size={48} color={theme.textSecondary} />
            <ThemedText
              type="body"
              style={{ color: theme.textSecondary, marginTop: Spacing.md, textAlign: "center" }}
            >
              No meal preps available.{"\n"}Create one first!
            </ThemedText>
            <Button
              onPress={() => {
                navigation.goBack();
                navigation.navigate("MealCreator");
              }}
              style={{ marginTop: Spacing.xl }}
            >
              Create Meal
            </Button>
          </View>
        ) : (
          <>
            {store.meals.map((meal) => {
              const perServing = store.getMealNutritionPerServing(meal.id);
              const isSelected = selectedMeal?.id === meal.id;

              return (
                <Card
                  key={meal.id}
                  onPress={() => handleSelectMeal(meal)}
                  style={{
                    marginBottom: Spacing.md,
                    ...(isSelected ? { borderColor: theme.primary, borderWidth: 2 } : {}),
                  }}
                >
                  <View style={styles.mealHeader}>
                    <View style={styles.mealInfo}>
                      <ThemedText type="h4">{meal.name}</ThemedText>
                      <ThemedText type="small" style={{ color: theme.textSecondary }}>
                        {meal.totalServings} servings total
                      </ThemedText>
                    </View>
                    {isSelected ? (
                      <Feather name="check-circle" size={24} color={theme.primary} />
                    ) : null}
                  </View>

                  <View style={[styles.nutritionRow, { borderTopColor: theme.border }]}>
                    <View style={styles.nutritionItem}>
                      <ThemedText type="body" style={{ color: theme.primary }}>
                        {Math.round(perServing.calories)} cal
                      </ThemedText>
                    </View>
                    <View style={styles.nutritionItem}>
                      <ThemedText type="small" style={{ color: theme.protein }}>
                        P: {Math.round(perServing.protein)}g
                      </ThemedText>
                    </View>
                    <View style={styles.nutritionItem}>
                      <ThemedText type="small" style={{ color: theme.carbs }}>
                        C: {Math.round(perServing.carbs)}g
                      </ThemedText>
                    </View>
                    <View style={styles.nutritionItem}>
                      <ThemedText type="small" style={{ color: theme.fats }}>
                        F: {Math.round(perServing.fats)}g
                      </ThemedText>
                    </View>
                  </View>
                </Card>
              );
            })}

            {selectedMeal ? (
              <Card style={styles.logCard}>
                <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
                  Log "{selectedMeal.name}"
                </ThemedText>

                <View style={styles.servingsRow}>
                  <ThemedText type="body">Servings to log:</ThemedText>
                  <TextInput
                    value={servingsToLog}
                    onChangeText={setServingsToLog}
                    keyboardType="decimal-pad"
                    style={[
                      styles.servingsInput,
                      { backgroundColor: theme.backgroundDefault, color: theme.text },
                    ]}
                  />
                </View>

                <View style={[styles.previewRow, { backgroundColor: theme.backgroundDefault }]}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    This will add:
                  </ThemedText>
                  <View style={styles.previewNutrition}>
                    {(() => {
                      const perServing = store.getMealNutritionPerServing(selectedMeal.id);
                      const multiplier = parseFloat(servingsToLog) || 1;
                      return (
                        <>
                          <ThemedText type="body" style={{ color: theme.primary }}>
                            {Math.round(perServing.calories * multiplier)} cal
                          </ThemedText>
                          <ThemedText type="small" style={{ color: theme.protein }}>
                            P: {Math.round(perServing.protein * multiplier)}g
                          </ThemedText>
                          <ThemedText type="small" style={{ color: theme.carbs }}>
                            C: {Math.round(perServing.carbs * multiplier)}g
                          </ThemedText>
                          <ThemedText type="small" style={{ color: theme.fats }}>
                            F: {Math.round(perServing.fats * multiplier)}g
                          </ThemedText>
                        </>
                      );
                    })()}
                  </View>
                </View>

                <Button onPress={handleLogMeal}>
                  Add to {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
                </Button>
              </Card>
            ) : null}
          </>
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
  mealTypeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  mealTypeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  empty: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  mealCard: {
    marginBottom: Spacing.md,
  },
  selectedCard: {
    borderWidth: 2,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealInfo: {
    flex: 1,
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
  logCard: {
    marginTop: Spacing.lg,
  },
  servingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  servingsInput: {
    width: 80,
    height: 40,
    borderRadius: BorderRadius.sm,
    textAlign: "center",
    fontSize: 16,
  },
  previewRow: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  previewNutrition: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
});
