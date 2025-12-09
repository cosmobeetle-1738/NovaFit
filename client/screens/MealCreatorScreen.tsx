import React, { useState, useMemo } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useStore, MealIngredient, Meal, Food } from "@/lib/store";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { NutritionStackParamList } from "@/navigation/NutritionStackNavigator";

type Navigation = NativeStackNavigationProp<NutritionStackParamList>;
type Route = RouteProp<NutritionStackParamList, "MealCreator">;

const generateIngredientId = () => Math.random().toString(36).substring(2, 15);

export default function MealCreatorScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { theme } = useTheme();
  const store = useStore();

  const editMealId = route.params?.mealId;
  const existingMeal = editMealId ? store.getMealById(editMealId) : null;

  const [mealName, setMealName] = useState(existingMeal?.name || "");
  const [totalServings, setTotalServings] = useState(
    existingMeal?.totalServings?.toString() || "4"
  );
  const [ingredients, setIngredients] = useState<MealIngredient[]>(
    existingMeal?.ingredients || []
  );

  const [newIngredient, setNewIngredient] = useState({
    name: "",
    amount: "",
    unit: "g",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    fiber: "",
  });

  const [selectedFoodReference, setSelectedFoodReference] = useState<{
    originalServingSize: number;
    originalCalories: number;
    originalProtein: number;
    originalCarbs: number;
    originalFats: number;
    originalFiber: number;
  } | null>(null);

  const [showStoredFoods, setShowStoredFoods] = useState(false);
  const [foodSearch, setFoodSearch] = useState("");

  const filteredFoods = useMemo(() => {
    if (!foodSearch.trim()) return store.foods;
    const search = foodSearch.toLowerCase();
    return store.foods.filter((food) =>
      food.name.toLowerCase().includes(search)
    );
  }, [store.foods, foodSearch]);

  const handleSelectStoredFood = (food: Food) => {
    const servingSize = parseFloat(food.servingSize) || 100;
    setSelectedFoodReference({
      originalServingSize: servingSize,
      originalCalories: food.calories,
      originalProtein: food.protein,
      originalCarbs: food.carbs,
      originalFats: food.fats,
      originalFiber: food.fiber || 0,
    });
    setNewIngredient({
      name: food.name,
      amount: String(servingSize),
      unit: "g",
      calories: String(food.calories),
      protein: String(food.protein),
      carbs: String(food.carbs),
      fats: String(food.fats),
      fiber: String(food.fiber || 0),
    });
    setShowStoredFoods(false);
    setFoodSearch("");
  };

  const handleAmountChange = (newAmount: string) => {
    if (selectedFoodReference) {
      const amount = parseFloat(newAmount) || 0;
      const ratio = amount / selectedFoodReference.originalServingSize;
      setNewIngredient({
        ...newIngredient,
        amount: newAmount,
        calories: String(Math.round(selectedFoodReference.originalCalories * ratio * 10) / 10),
        protein: String(Math.round(selectedFoodReference.originalProtein * ratio * 10) / 10),
        carbs: String(Math.round(selectedFoodReference.originalCarbs * ratio * 10) / 10),
        fats: String(Math.round(selectedFoodReference.originalFats * ratio * 10) / 10),
        fiber: String(Math.round(selectedFoodReference.originalFiber * ratio * 10) / 10),
      });
    } else {
      setNewIngredient({ ...newIngredient, amount: newAmount });
    }
  };

  const calculateTotals = () => {
    return ingredients.reduce(
      (acc, ing) => ({
        calories: acc.calories + ing.calories,
        protein: acc.protein + ing.protein,
        carbs: acc.carbs + ing.carbs,
        fats: acc.fats + ing.fats,
        fiber: acc.fiber + ing.fiber,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
    );
  };

  const calculatePerServing = () => {
    const totals = calculateTotals();
    const servings = parseFloat(totalServings) || 1;
    return {
      calories: totals.calories / servings,
      protein: totals.protein / servings,
      carbs: totals.carbs / servings,
      fats: totals.fats / servings,
      fiber: totals.fiber / servings,
    };
  };

  const handleAddIngredient = () => {
    if (!newIngredient.name.trim()) return;

    const ingredient: MealIngredient = {
      id: generateIngredientId(),
      name: newIngredient.name.trim(),
      amount: parseFloat(newIngredient.amount) || 1,
      unit: newIngredient.unit || "g",
      calories: parseFloat(newIngredient.calories) || 0,
      protein: parseFloat(newIngredient.protein) || 0,
      carbs: parseFloat(newIngredient.carbs) || 0,
      fats: parseFloat(newIngredient.fats) || 0,
      fiber: parseFloat(newIngredient.fiber) || 0,
    };

    setIngredients([...ingredients, ingredient]);
    setNewIngredient({
      name: "",
      amount: "",
      unit: "g",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
      fiber: "",
    });
    setSelectedFoodReference(null);
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter((ing) => ing.id !== id));
  };

  const handleSaveMeal = () => {
    if (!mealName.trim() || ingredients.length === 0) return;

    const mealData = {
      name: mealName.trim(),
      ingredients,
      totalServings: parseFloat(totalServings) || 1,
    };

    if (editMealId) {
      store.updateMeal(editMealId, mealData);
    } else {
      store.addMeal(mealData);
    }

    navigation.goBack();
  };

  const totals = calculateTotals();
  const perServing = calculatePerServing();

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing["5xl"],
        paddingHorizontal: Spacing.lg,
      }}
    >
      <View style={styles.field}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Meal Name *
        </ThemedText>
        <TextInput
          value={mealName}
          onChangeText={setMealName}
          placeholder="e.g., Chicken Rice Bowl"
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.input,
            { backgroundColor: theme.backgroundDefault, color: theme.text },
          ]}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Total Servings (batch size)
        </ThemedText>
        <TextInput
          value={totalServings}
          onChangeText={setTotalServings}
          placeholder="4"
          keyboardType="decimal-pad"
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.input,
            { backgroundColor: theme.backgroundDefault, color: theme.text, width: 100 },
          ]}
        />
      </View>

      <Card style={styles.ingredientsCard}>
        <View style={styles.sectionHeader}>
          <ThemedText type="h4">Ingredients</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {ingredients.length} items
          </ThemedText>
        </View>

        {ingredients.map((ing) => (
          <View key={ing.id} style={[styles.ingredientItem, { borderBottomColor: theme.border }]}>
            <View style={styles.ingredientInfo}>
              <ThemedText type="body">{ing.name}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {ing.amount} {ing.unit} - {Math.round(ing.calories)} cal
              </ThemedText>
            </View>
            <Pressable
              onPress={() => handleRemoveIngredient(ing.id)}
              hitSlop={8}
            >
              <Feather name="x" size={20} color={theme.error} />
            </Pressable>
          </View>
        ))}

        {ingredients.length === 0 ? (
          <View style={styles.emptyIngredients}>
            <Feather name="list" size={32} color={theme.textSecondary} />
            <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
              No ingredients added yet
            </ThemedText>
          </View>
        ) : null}
      </Card>

      <Card style={styles.storedFoodsCard}>
        <Pressable
          onPress={() => setShowStoredFoods(!showStoredFoods)}
          style={styles.storedFoodsHeader}
        >
          <View style={styles.storedFoodsHeaderLeft}>
            <Feather name="database" size={18} color={theme.primary} />
            <ThemedText type="h4" style={{ marginLeft: Spacing.sm }}>
              Stored Foods
            </ThemedText>
          </View>
          <View style={styles.storedFoodsHeaderRight}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {store.foods.length} items
            </ThemedText>
            <Feather
              name={showStoredFoods ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.textSecondary}
              style={{ marginLeft: Spacing.xs }}
            />
          </View>
        </Pressable>

        {showStoredFoods ? (
          <View style={styles.storedFoodsContent}>
            <TextInput
              value={foodSearch}
              onChangeText={setFoodSearch}
              placeholder="Search stored foods..."
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.searchInput,
                { backgroundColor: theme.backgroundSecondary, color: theme.text },
              ]}
            />
            {filteredFoods.length === 0 ? (
              <View style={styles.emptyStoredFoods}>
                <Feather name="inbox" size={24} color={theme.textSecondary} />
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
                >
                  {store.foods.length === 0
                    ? "No stored foods yet"
                    : "No matching foods"}
                </ThemedText>
              </View>
            ) : (
              filteredFoods.slice(0, 8).map((food) => (
                <Pressable
                  key={food.id}
                  onPress={() => handleSelectStoredFood(food)}
                  style={[
                    styles.storedFoodItem,
                    { borderBottomColor: theme.border },
                  ]}
                >
                  <View style={styles.storedFoodInfo}>
                    <ThemedText type="body">{food.name}</ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      {food.calories} cal - P:{food.protein}g C:{food.carbs}g F:{food.fats}g
                    </ThemedText>
                  </View>
                  <Feather name="plus-circle" size={20} color={theme.primary} />
                </Pressable>
              ))
            )}
            {filteredFoods.length > 8 ? (
              <ThemedText
                type="small"
                style={{
                  color: theme.textSecondary,
                  textAlign: "center",
                  marginTop: Spacing.sm,
                }}
              >
                +{filteredFoods.length - 8} more - refine your search
              </ThemedText>
            ) : null}
          </View>
        ) : null}
      </Card>

      <Card style={styles.addIngredientCard}>
        <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
          Add Ingredient
        </ThemedText>

        <View style={styles.ingredientRow}>
          <View style={[styles.ingredientField, { flex: 2 }]}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Name *
            </ThemedText>
            <TextInput
              value={newIngredient.name}
              onChangeText={(text) =>
                setNewIngredient({ ...newIngredient, name: text })
              }
              placeholder="Ingredient name"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.smallInput,
                { backgroundColor: theme.backgroundSecondary, color: theme.text },
              ]}
            />
          </View>
          <View style={styles.ingredientField}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Amount
            </ThemedText>
            <TextInput
              value={newIngredient.amount}
              onChangeText={handleAmountChange}
              placeholder="100"
              keyboardType="decimal-pad"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.smallInput,
                { backgroundColor: theme.backgroundSecondary, color: theme.text },
              ]}
            />
          </View>
          <View style={styles.ingredientField}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Unit
            </ThemedText>
            <TextInput
              value={newIngredient.unit}
              onChangeText={(text) =>
                setNewIngredient({ ...newIngredient, unit: text })
              }
              placeholder="g"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.smallInput,
                { backgroundColor: theme.backgroundSecondary, color: theme.text },
              ]}
            />
          </View>
        </View>

        <View style={styles.nutritionRow}>
          <View style={styles.nutritionField}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Calories
            </ThemedText>
            <TextInput
              value={newIngredient.calories}
              onChangeText={(text) =>
                setNewIngredient({ ...newIngredient, calories: text })
              }
              placeholder="0"
              keyboardType="decimal-pad"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.nutritionInput,
                { backgroundColor: theme.backgroundSecondary, color: theme.text },
              ]}
            />
          </View>
          <View style={styles.nutritionField}>
            <ThemedText type="small" style={{ color: theme.protein }}>
              Protein
            </ThemedText>
            <TextInput
              value={newIngredient.protein}
              onChangeText={(text) =>
                setNewIngredient({ ...newIngredient, protein: text })
              }
              placeholder="0"
              keyboardType="decimal-pad"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.nutritionInput,
                { backgroundColor: theme.backgroundSecondary, color: theme.text },
              ]}
            />
          </View>
          <View style={styles.nutritionField}>
            <ThemedText type="small" style={{ color: theme.carbs }}>
              Carbs
            </ThemedText>
            <TextInput
              value={newIngredient.carbs}
              onChangeText={(text) =>
                setNewIngredient({ ...newIngredient, carbs: text })
              }
              placeholder="0"
              keyboardType="decimal-pad"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.nutritionInput,
                { backgroundColor: theme.backgroundSecondary, color: theme.text },
              ]}
            />
          </View>
          <View style={styles.nutritionField}>
            <ThemedText type="small" style={{ color: theme.fats }}>
              Fats
            </ThemedText>
            <TextInput
              value={newIngredient.fats}
              onChangeText={(text) =>
                setNewIngredient({ ...newIngredient, fats: text })
              }
              placeholder="0"
              keyboardType="decimal-pad"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.nutritionInput,
                { backgroundColor: theme.backgroundSecondary, color: theme.text },
              ]}
            />
          </View>
          <View style={styles.nutritionField}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Fiber
            </ThemedText>
            <TextInput
              value={newIngredient.fiber}
              onChangeText={(text) =>
                setNewIngredient({ ...newIngredient, fiber: text })
              }
              placeholder="0"
              keyboardType="decimal-pad"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.nutritionInput,
                { backgroundColor: theme.backgroundSecondary, color: theme.text },
              ]}
            />
          </View>
        </View>

        <Pressable
          onPress={handleAddIngredient}
          disabled={!newIngredient.name.trim()}
          style={[
            styles.addButton,
            {
              backgroundColor: newIngredient.name.trim()
                ? theme.primary
                : theme.backgroundDefault,
            },
          ]}
        >
          <Feather
            name="plus"
            size={18}
            color={newIngredient.name.trim() ? "#FFF" : theme.textSecondary}
          />
          <ThemedText
            type="body"
            style={{
              color: newIngredient.name.trim() ? "#FFF" : theme.textSecondary,
              marginLeft: Spacing.xs,
            }}
          >
            Add Ingredient
          </ThemedText>
        </Pressable>
      </Card>

      {ingredients.length > 0 ? (
        <Card style={styles.totalsCard}>
          <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
            Nutrition Summary
          </ThemedText>

          <View style={styles.totalsRow}>
            <View style={styles.totalsColumn}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Total Batch
              </ThemedText>
              <ThemedText type="h3">{Math.round(totals.calories)}</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                calories
              </ThemedText>
              <View style={styles.macroList}>
                <ThemedText type="small" style={{ color: theme.protein }}>
                  P: {Math.round(totals.protein)}g
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.carbs }}>
                  C: {Math.round(totals.carbs)}g
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.fats }}>
                  F: {Math.round(totals.fats)}g
                </ThemedText>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.totalsColumn}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Per Serving ({totalServings || 1})
              </ThemedText>
              <ThemedText type="h3" style={{ color: theme.primary }}>
                {Math.round(perServing.calories)}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                calories
              </ThemedText>
              <View style={styles.macroList}>
                <ThemedText type="small" style={{ color: theme.protein }}>
                  P: {Math.round(perServing.protein)}g
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.carbs }}>
                  C: {Math.round(perServing.carbs)}g
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.fats }}>
                  F: {Math.round(perServing.fats)}g
                </ThemedText>
              </View>
            </View>
          </View>
        </Card>
      ) : null}

      <Button
        onPress={handleSaveMeal}
        disabled={!mealName.trim() || ingredients.length === 0}
      >
        {editMealId ? "Update Meal" : "Save Meal"}
      </Button>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
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
  ingredientsCard: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  ingredientInfo: {
    flex: 1,
  },
  emptyIngredients: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  storedFoodsCard: {
    marginBottom: Spacing.lg,
  },
  storedFoodsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  storedFoodsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  storedFoodsHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  storedFoodsContent: {
    marginTop: Spacing.md,
  },
  searchInput: {
    height: 40,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    fontSize: 14,
  },
  emptyStoredFoods: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  storedFoodItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  storedFoodInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  addIngredientCard: {
    marginBottom: Spacing.lg,
  },
  ingredientRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  ingredientField: {
    flex: 1,
  },
  smallInput: {
    height: 40,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.xs,
    fontSize: 14,
  },
  nutritionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  nutritionField: {
    width: "18%",
    flexGrow: 1,
    minWidth: 60,
  },
  nutritionInput: {
    height: 36,
    borderRadius: BorderRadius.sm,
    textAlign: "center",
    marginTop: Spacing.xs,
    fontSize: 14,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  totalsCard: {
    marginBottom: Spacing.xl,
  },
  totalsRow: {
    flexDirection: "row",
  },
  totalsColumn: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    marginHorizontal: Spacing.md,
  },
  macroList: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
});
