import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { FoodItem } from "@/components/FoodItem";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useStore, Food } from "@/lib/store";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { NutritionStackParamList } from "@/navigation/NutritionStackNavigator";

type Navigation = NativeStackNavigationProp<NutritionStackParamList>;
type Route = RouteProp<NutritionStackParamList, "AddFood">;

export default function AddFoodScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { theme } = useTheme();
  const store = useStore();

  const mealType = (route.params?.mealType as any) || "snack";
  const today = new Date().toISOString().split("T")[0];

  const [mode, setMode] = useState<"select" | "create">("select");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servings, setServings] = useState("1");

  const [newFood, setNewFood] = useState({
    name: "",
    servingSize: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    fiber: "",
  });
  const [saveToDatabase, setSaveToDatabase] = useState(true);

  const filteredFoods = store.foods.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
  };

  const handleAddEntry = () => {
    if (!selectedFood) return;

    store.addFoodEntry({
      foodId: selectedFood.id,
      food: selectedFood,
      mealType,
      servings: parseFloat(servings) || 1,
      date: today,
    });

    navigation.goBack();
  };

  const handleCreateFood = () => {
    if (!newFood.name.trim()) return;

    const food = store.addFood({
      name: newFood.name.trim(),
      servingSize: newFood.servingSize || "1 serving",
      calories: parseFloat(newFood.calories) || 0,
      protein: parseFloat(newFood.protein) || 0,
      carbs: parseFloat(newFood.carbs) || 0,
      fats: parseFloat(newFood.fats) || 0,
      fiber: parseFloat(newFood.fiber) || 0,
      isSaved: saveToDatabase,
    });

    store.addFoodEntry({
      foodId: food.id,
      food,
      mealType,
      servings: 1,
      date: today,
    });

    navigation.goBack();
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <View style={styles.tabs}>
        <Pressable
          onPress={() => setMode("select")}
          style={[
            styles.tab,
            mode === "select" && { backgroundColor: theme.primary },
          ]}
        >
          <ThemedText
            type="small"
            style={{ color: mode === "select" ? "#FFF" : theme.text }}
          >
            Select Food
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setMode("create")}
          style={[
            styles.tab,
            mode === "create" && { backgroundColor: theme.primary },
          ]}
        >
          <ThemedText
            type="small"
            style={{ color: mode === "create" ? "#FFF" : theme.text }}
          >
            Create New
          </ThemedText>
        </Pressable>
      </View>

      {mode === "select" ? (
        <>
          <View
            style={[
              styles.searchBar,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <Feather name="search" size={18} color={theme.textSecondary} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search foods..."
              placeholderTextColor={theme.textSecondary}
              style={[styles.searchInput, { color: theme.text }]}
            />
          </View>

          {selectedFood ? (
            <Card style={styles.selectedCard}>
              <View style={styles.selectedHeader}>
                <ThemedText type="h4">Selected</ThemedText>
                <Pressable onPress={() => setSelectedFood(null)}>
                  <Feather name="x" size={20} color={theme.textSecondary} />
                </Pressable>
              </View>
              <FoodItem food={selectedFood} showMacros />
              <View style={styles.servingsRow}>
                <ThemedText type="body">Servings:</ThemedText>
                <TextInput
                  value={servings}
                  onChangeText={setServings}
                  keyboardType="decimal-pad"
                  style={[
                    styles.servingsInput,
                    { backgroundColor: theme.backgroundDefault, color: theme.text },
                  ]}
                />
              </View>
              <Button onPress={handleAddEntry}>Add to {mealType}</Button>
            </Card>
          ) : (
            <View style={styles.foodList}>
              {filteredFoods.map((food) => (
                <FoodItem
                  key={food.id}
                  food={food}
                  onPress={() => handleSelectFood(food)}
                  showMacros={false}
                />
              ))}
              {filteredFoods.length === 0 ? (
                <View style={styles.empty}>
                  <Feather name="search" size={40} color={theme.textSecondary} />
                  <ThemedText
                    type="body"
                    style={{ color: theme.textSecondary, marginTop: Spacing.md }}
                  >
                    No foods found
                  </ThemedText>
                  <Pressable
                    onPress={() => setMode("create")}
                    style={[styles.createLink, { borderColor: theme.primary }]}
                  >
                    <ThemedText type="body" style={{ color: theme.primary }}>
                      Create a new food
                    </ThemedText>
                  </Pressable>
                </View>
              ) : null}
            </View>
          )}
        </>
      ) : (
        <View style={styles.createForm}>
          <View style={styles.field}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Food Name *
            </ThemedText>
            <TextInput
              value={newFood.name}
              onChangeText={(text) => setNewFood({ ...newFood, name: text })}
              placeholder="e.g., Chicken Breast"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                { backgroundColor: theme.backgroundDefault, color: theme.text },
              ]}
            />
          </View>

          <View style={styles.field}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Serving Size
            </ThemedText>
            <TextInput
              value={newFood.servingSize}
              onChangeText={(text) => setNewFood({ ...newFood, servingSize: text })}
              placeholder="e.g., 100g or 1 cup"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                { backgroundColor: theme.backgroundDefault, color: theme.text },
              ]}
            />
          </View>

          <Card style={styles.nutritionCard}>
            <ThemedText type="h4" style={styles.nutritionTitle}>
              Nutrition Facts
            </ThemedText>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionField}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Calories
                </ThemedText>
                <TextInput
                  value={newFood.calories}
                  onChangeText={(text) =>
                    setNewFood({ ...newFood, calories: text })
                  }
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  style={[
                    styles.nutritionInput,
                    { backgroundColor: theme.backgroundSecondary, color: theme.text },
                  ]}
                />
              </View>
              <View style={styles.nutritionField}>
                <ThemedText type="small" style={{ color: theme.protein }}>
                  Protein (g)
                </ThemedText>
                <TextInput
                  value={newFood.protein}
                  onChangeText={(text) =>
                    setNewFood({ ...newFood, protein: text })
                  }
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  style={[
                    styles.nutritionInput,
                    { backgroundColor: theme.backgroundSecondary, color: theme.text },
                  ]}
                />
              </View>
              <View style={styles.nutritionField}>
                <ThemedText type="small" style={{ color: theme.carbs }}>
                  Carbs (g)
                </ThemedText>
                <TextInput
                  value={newFood.carbs}
                  onChangeText={(text) => setNewFood({ ...newFood, carbs: text })}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  style={[
                    styles.nutritionInput,
                    { backgroundColor: theme.backgroundSecondary, color: theme.text },
                  ]}
                />
              </View>
              <View style={styles.nutritionField}>
                <ThemedText type="small" style={{ color: theme.fats }}>
                  Fats (g)
                </ThemedText>
                <TextInput
                  value={newFood.fats}
                  onChangeText={(text) => setNewFood({ ...newFood, fats: text })}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  style={[
                    styles.nutritionInput,
                    { backgroundColor: theme.backgroundSecondary, color: theme.text },
                  ]}
                />
              </View>
              <View style={styles.nutritionField}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Fiber (g)
                </ThemedText>
                <TextInput
                  value={newFood.fiber}
                  onChangeText={(text) => setNewFood({ ...newFood, fiber: text })}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  style={[
                    styles.nutritionInput,
                    { backgroundColor: theme.backgroundSecondary, color: theme.text },
                  ]}
                />
              </View>
            </View>
          </Card>

          <Pressable
            onPress={() => setSaveToDatabase(!saveToDatabase)}
            style={styles.checkboxRow}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: saveToDatabase
                    ? theme.primary
                    : theme.backgroundDefault,
                  borderColor: saveToDatabase ? theme.primary : theme.border,
                },
              ]}
            >
              {saveToDatabase ? (
                <Feather name="check" size={14} color="#FFF" />
              ) : null}
            </View>
            <ThemedText type="body">Save to My Foods</ThemedText>
          </Pressable>

          <Button onPress={handleCreateFood} disabled={!newFood.name.trim()}>
            Add Food
          </Button>
        </View>
      )}
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
    borderRadius: BorderRadius.full,
    backgroundColor: "transparent",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
  foodList: {},
  selectedCard: {
    marginBottom: Spacing.lg,
  },
  selectedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  servingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: Spacing.lg,
  },
  servingsInput: {
    width: 80,
    height: 40,
    borderRadius: BorderRadius.sm,
    textAlign: "center",
    fontSize: 16,
  },
  empty: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  createLink: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderWidth: 1,
    borderRadius: BorderRadius.full,
  },
  createForm: {},
  field: {
    marginBottom: Spacing.lg,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
    fontSize: 16,
  },
  nutritionCard: {
    marginBottom: Spacing.lg,
  },
  nutritionTitle: {
    marginBottom: Spacing.md,
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  nutritionField: {
    width: "30%",
    flexGrow: 1,
  },
  nutritionInput: {
    height: 40,
    borderRadius: BorderRadius.sm,
    textAlign: "center",
    marginTop: Spacing.xs,
    fontSize: 16,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.xs,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
});
