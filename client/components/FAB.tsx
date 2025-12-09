import React, { useState } from "react";
import { View, StyleSheet, Pressable, Modal } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  WithSpringConfig,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface FABAction {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}

interface FABProps {
  actions: FABAction[];
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.5,
  stiffness: 150,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FAB({ actions }: FABProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [isOpen, setIsOpen] = useState(false);
  const expanded = useSharedValue(0);
  const scale = useSharedValue(1);

  const toggleMenu = () => {
    if (isOpen) {
      expanded.value = withTiming(0, { duration: 200 });
    } else {
      expanded.value = withSpring(1, springConfig);
    }
    setIsOpen(!isOpen);
  };

  const handleAction = (action: FABAction) => {
    expanded.value = withTiming(0, { duration: 200 });
    setIsOpen(false);
    action.onPress();
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.95, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const fabStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${interpolate(expanded.value, [0, 1], [0, 45])}deg` },
    ],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: expanded.value * 0.5,
    pointerEvents: expanded.value > 0 ? "auto" : "none",
  }));

  return (
    <>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "#000" },
          overlayStyle,
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={toggleMenu} />
      </Animated.View>

      <View
        style={[
          styles.container,
          { bottom: tabBarHeight + Spacing.xl, right: Spacing.lg },
        ]}
      >
        {actions.map((action, index) => {
          const actionStyle = useAnimatedStyle(() => {
            const translateY = interpolate(
              expanded.value,
              [0, 1],
              [0, -(index + 1) * 70]
            );
            const opacity = interpolate(expanded.value, [0, 0.5, 1], [0, 0, 1]);
            const actionScale = interpolate(
              expanded.value,
              [0, 0.5, 1],
              [0.5, 0.8, 1]
            );
            return {
              transform: [{ translateY }, { scale: actionScale }],
              opacity,
            };
          });

          return (
            <Animated.View key={action.label} style={[styles.action, actionStyle]}>
              <Pressable
                style={[styles.actionButton, { backgroundColor: theme.primary }]}
                onPress={() => handleAction(action)}
              >
                <View style={styles.actionContent}>
                  <ThemedText
                    type="small"
                    style={[styles.actionLabel, { color: "#FFF" }]}
                  >
                    {action.label}
                  </ThemedText>
                  <View
                    style={[
                      styles.actionIcon,
                      { backgroundColor: theme.primaryLight },
                    ]}
                  >
                    <Feather name={action.icon} size={20} color="#FFF" />
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          );
        })}

        <AnimatedPressable
          onPress={toggleMenu}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.fab,
            { backgroundColor: theme.primary },
            Shadows.fab,
            fabStyle,
          ]}
        >
          <Feather name="plus" size={24} color="#FFF" />
        </AnimatedPressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignItems: "flex-end",
  },
  fab: {
    width: Spacing.fabSize,
    height: Spacing.fabSize,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  action: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  actionButton: {
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  actionContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: Spacing.lg,
  },
  actionLabel: {
    fontWeight: "600",
    marginRight: Spacing.sm,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
