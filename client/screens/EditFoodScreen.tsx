import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/lib/store";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { NutritionStackParamList } from "@/navigation/NutritionStackNavigator";

type Navigation = NativeStackNavigationProp<NutritionStackParamList>;
type Route = RouteProp<NutritionStackParamList, "EditFood">;

export default function EditFoodScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { theme } = useTheme();
  const store = useStore();

  const foodId = route.params?.foodId;
  const existingFood = store.foods.find((f) => f.id === foodId);

  const [foodData, setFoodData] = useState({
    name: "",
    servingSize: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    fiber: "",
  });

  useEffect(() => {
    if (existingFood) {
      setFoodData({
        name: existingFood.name,
        servingSize: existingFood.servingSize,
        calories: String(existingFood.calories),
        protein: String(existingFood.protein),
        carbs: String(existingFood.carbs),
        fats: String(existingFood.fats),
        fiber: String(existingFood.fiber),
      });
    }
  }, [existingFood]);

  const handleSave = () => {
    if (!foodId || !foodData.name.trim()) return;

    store.updateFood(foodId, {
      name: foodData.name.trim(),
      servingSize: foodData.servingSize || "1 serving",
      calories: parseFloat(foodData.calories) || 0,
      protein: parseFloat(foodData.protein) || 0,
      carbs: parseFloat(foodData.carbs) || 0,
      fats: parseFloat(foodData.fats) || 0,
      fiber: parseFloat(foodData.fiber) || 0,
    });

    navigation.goBack();
  };

  if (!existingFood) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText type="body" style={{ textAlign: "center" }}>
          Food not found
        </ThemedText>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <View style={styles.field}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          Food Name *
        </ThemedText>
        <TextInput
          value={foodData.name}
          onChangeText={(text) => setFoodData({ ...foodData, name: text })}
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
          value={foodData.servingSize}
          onChangeText={(text) => setFoodData({ ...foodData, servingSize: text })}
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
              value={foodData.calories}
              onChangeText={(text) => setFoodData({ ...foodData, calories: text })}
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
              value={foodData.protein}
              onChangeText={(text) => setFoodData({ ...foodData, protein: text })}
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
              value={foodData.carbs}
              onChangeText={(text) => setFoodData({ ...foodData, carbs: text })}
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
              value={foodData.fats}
              onChangeText={(text) => setFoodData({ ...foodData, fats: text })}
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
              value={foodData.fiber}
              onChangeText={(text) => setFoodData({ ...foodData, fiber: text })}
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

      <Button onPress={handleSave} disabled={!foodData.name.trim()}>
        Save Changes
      </Button>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
});
