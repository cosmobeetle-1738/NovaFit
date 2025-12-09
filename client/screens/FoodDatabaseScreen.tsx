import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { FoodItem } from "@/components/FoodItem";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/lib/store";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { NutritionStackParamList } from "@/navigation/NutritionStackNavigator";

type Navigation = NativeStackNavigationProp<NutritionStackParamList>;

export default function FoodDatabaseScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<Navigation>();
  const { theme } = useTheme();
  const store = useStore();

  const [searchQuery, setSearchQuery] = useState("");

  const savedFoods = store.foods.filter(
    (food) =>
      food.isSaved &&
      food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (foodId: string) => {
    const food = store.foods.find((f) => f.id === foodId);
    Alert.alert(
      "Delete Food",
      `Are you sure you want to delete "${food?.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => store.deleteFood(foodId),
        },
      ]
    );
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <View
        style={[styles.searchBar, { backgroundColor: theme.backgroundDefault }]}
      >
        <Feather name="search" size={18} color={theme.textSecondary} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search your foods..."
          placeholderTextColor={theme.textSecondary}
          style={[styles.searchInput, { color: theme.text }]}
        />
      </View>

      <View style={styles.header}>
        <ThemedText type="h4">Saved Foods ({savedFoods.length})</ThemedText>
        <Pressable
          onPress={() => navigation.navigate("ScanNutrition")}
          style={[styles.scanButton, { backgroundColor: theme.primary }]}
        >
          <Feather name="camera" size={16} color="#FFF" />
          <ThemedText type="small" style={{ color: "#FFF", marginLeft: 4 }}>
            Scan New
          </ThemedText>
        </Pressable>
      </View>

      {savedFoods.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="database" size={48} color={theme.textSecondary} />
          <ThemedText
            type="body"
            style={{ color: theme.textSecondary, marginTop: Spacing.md }}
          >
            {searchQuery ? "No matching foods" : "No saved foods yet"}
          </ThemedText>
          <ThemedText
            type="small"
            style={{
              color: theme.textSecondary,
              marginTop: Spacing.sm,
              textAlign: "center",
            }}
          >
            Scan nutrition labels or create foods manually to build your
            personal database
          </ThemedText>
        </View>
      ) : (
        <View style={styles.foodList}>
          {savedFoods.map((food) => (
            <FoodItem
              key={food.id}
              food={food}
              onPress={() => navigation.navigate("EditFood", { foodId: food.id })}
              onDelete={() => handleDelete(food.id)}
              showMacros
            />
          ))}
        </View>
      )}
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  foodList: {},
  empty: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
});
