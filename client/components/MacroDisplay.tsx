import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ProgressBar } from "@/components/ProgressBar";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface MacroDisplayProps {
  label: string;
  current: number;
  goal: number;
  color: string;
  unit?: string;
}

export function MacroDisplay({
  label,
  current,
  goal,
  color,
  unit = "g",
}: MacroDisplayProps) {
  const { theme } = useTheme();
  const progress = goal > 0 ? current / goal : 0;

  return (
    <View style={styles.container}>
      <ThemedText type="small" style={[styles.label, { color }]}>
        {label}
      </ThemedText>
      <ProgressBar progress={progress} color={color} height={6} />
      <ThemedText type="small" style={[styles.value, { color: theme.textSecondary }]}>
        {Math.round(current)}/{goal}{unit}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  label: {
    marginBottom: Spacing.xs,
    fontSize: 14,
  },
  value: {
    marginTop: Spacing.xs,
    fontSize: 12,
  },
});
