import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { FoodItem } from "@/components/FoodItem";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { FoodEntry } from "@/lib/store";

interface MealSectionProps {
  title: string;
  entries: FoodEntry[];
  onAddFood: () => void;
  onDeleteEntry: (id: string) => void;
}

export function MealSection({
  title,
  entries,
  onAddFood,
  onDeleteEntry,
}: MealSectionProps) {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);
  const rotation = useSharedValue(0);

  const totalCalories = entries.reduce(
    (sum, e) => sum + e.food.calories * e.servings,
    0
  );

  const toggleExpanded = () => {
    rotation.value = withTiming(isExpanded ? -90 : 0);
    setIsExpanded(!isExpanded);
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <Pressable onPress={toggleExpanded} style={styles.header}>
        <View style={styles.titleRow}>
          <Animated.View style={chevronStyle}>
            <Feather name="chevron-down" size={20} color={theme.textSecondary} />
          </Animated.View>
          <ThemedText type="h4" style={styles.title}>
            {title}
          </ThemedText>
        </View>
        <View style={styles.caloriesRow}>
          <ThemedText type="body" style={{ color: theme.primary }}>
            {Math.round(totalCalories)}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {" "}cal
          </ThemedText>
        </View>
      </Pressable>

      {isExpanded ? (
        <View style={styles.content}>
          {entries.map((entry) => (
            <FoodItem
              key={entry.id}
              entry={entry}
              onDelete={() => onDeleteEntry(entry.id)}
            />
          ))}
          <Pressable
            onPress={onAddFood}
            style={[styles.addButton, { borderColor: theme.border }]}
          >
            <Feather name="plus" size={18} color={theme.primary} />
            <ThemedText type="small" style={{ color: theme.primary, marginLeft: 4 }}>
              Add Food
            </ThemedText>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    marginLeft: Spacing.xs,
  },
  caloriesRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  content: {
    marginTop: Spacing.xs,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: BorderRadius.md,
  },
});
