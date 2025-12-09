import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { Workout } from "@/lib/store";

interface WorkoutCardProps {
  workout: Workout;
  onPress: () => void;
  onStart?: () => void;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function WorkoutCard({ workout, onPress, onStart }: WorkoutCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const scheduledDaysText = workout.scheduledDays
    .map((d) => dayNames[d])
    .join(", ");

  return (
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
      <View style={[styles.colorBar, { backgroundColor: workout.color }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="h4">{workout.name}</ThemedText>
          <View style={styles.exerciseCount}>
            <Feather
              name="list"
              size={14}
              color={theme.textSecondary}
            />
            <ThemedText
              type="small"
              style={{ color: theme.textSecondary, marginLeft: 4 }}
            >
              {workout.exercises.length} exercises
            </ThemedText>
          </View>
        </View>
        <View style={styles.footer}>
          <View style={styles.schedule}>
            <Feather
              name="calendar"
              size={14}
              color={theme.textSecondary}
            />
            <ThemedText
              type="small"
              style={{ color: theme.textSecondary, marginLeft: 4 }}
            >
              {scheduledDaysText || "Not scheduled"}
            </ThemedText>
          </View>
          {onStart ? (
            <Pressable
              onPress={onStart}
              style={[styles.startButton, { backgroundColor: theme.primary }]}
            >
              <Feather name="play" size={16} color="#FFF" />
              <ThemedText type="small" style={{ color: "#FFF", marginLeft: 4 }}>
                Start
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    flexDirection: "row",
  },
  colorBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  exerciseCount: {
    flexDirection: "row",
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  schedule: {
    flexDirection: "row",
    alignItems: "center",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
});
