import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { FoodEntry, Food } from "@/lib/store";

interface FoodItemProps {
  entry?: FoodEntry;
  food?: Food;
  onPress?: () => void;
  onDelete?: () => void;
  showMacros?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FoodItem({
  entry,
  food: foodProp,
  onPress,
  onDelete,
  showMacros = true,
}: FoodItemProps) {
  const { theme } = useTheme();
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  const food = entry?.food || foodProp;
  if (!food) return null;

  const calories = entry
    ? Math.round(food.calories * entry.servings)
    : food.calories;
  const protein = entry
    ? Math.round(food.protein * entry.servings)
    : food.protein;
  const carbs = entry ? Math.round(food.carbs * entry.servings) : food.carbs;
  const fats = entry ? Math.round(food.fats * entry.servings) : food.fats;

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = Math.max(e.translationX, -80);
      }
    })
    .onEnd((e) => {
      if (e.translationX < -40 && onDelete) {
        translateX.value = withTiming(-80);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }));

  const deleteStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < -20 ? 1 : 0,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.deleteBackground,
          { backgroundColor: theme.error },
          deleteStyle,
        ]}
      >
        <Pressable style={styles.deleteButton} onPress={onDelete}>
          <Feather name="trash-2" size={20} color="#FFF" />
        </Pressable>
      </Animated.View>
      <GestureDetector gesture={panGesture}>
        <AnimatedPressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.container,
            { backgroundColor: theme.backgroundDefault },
            animatedStyle,
          ]}
        >
          <View style={styles.main}>
            <ThemedText type="body" numberOfLines={1} style={styles.name}>
              {food.name}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {entry ? `${entry.servings} serving${entry.servings !== 1 ? "s" : ""}` : food.servingSize}
            </ThemedText>
          </View>
          <View style={styles.nutrition}>
            <ThemedText type="h4" style={{ color: theme.primary }}>
              {calories}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              cal
            </ThemedText>
          </View>
          {showMacros ? (
            <View style={styles.macros}>
              <View style={styles.macro}>
                <ThemedText type="small" style={{ color: theme.protein }}>
                  {protein}g
                </ThemedText>
                <ThemedText
                  type="small"
                  style={[styles.macroLabel, { color: theme.textSecondary }]}
                >
                  P
                </ThemedText>
              </View>
              <View style={styles.macro}>
                <ThemedText type="small" style={{ color: theme.carbs }}>
                  {carbs}g
                </ThemedText>
                <ThemedText
                  type="small"
                  style={[styles.macroLabel, { color: theme.textSecondary }]}
                >
                  C
                </ThemedText>
              </View>
              <View style={styles.macro}>
                <ThemedText type="small" style={{ color: theme.fats }}>
                  {fats}g
                </ThemedText>
                <ThemedText
                  type="small"
                  style={[styles.macroLabel, { color: theme.textSecondary }]}
                >
                  F
                </ThemedText>
              </View>
            </View>
          ) : null}
        </AnimatedPressable>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.sm,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  deleteBackground: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: Spacing.sm,
    width: 80,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  main: {
    flex: 1,
    marginRight: Spacing.md,
  },
  name: {
    marginBottom: 2,
  },
  nutrition: {
    alignItems: "center",
    marginRight: Spacing.md,
  },
  macros: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  macro: {
    alignItems: "center",
  },
  macroLabel: {
    fontSize: 10,
  },
});
