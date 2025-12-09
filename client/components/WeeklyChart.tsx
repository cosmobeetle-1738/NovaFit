import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface WeeklyChartProps {
  data: { day: string; value: number; completed?: boolean }[];
  maxValue?: number;
  label?: string;
  color?: string;
}

const { width: screenWidth } = Dimensions.get("window");

export function WeeklyChart({
  data,
  maxValue,
  label,
  color,
}: WeeklyChartProps) {
  const { theme } = useTheme();
  const chartColor = color || theme.primary;
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={styles.container}>
      {label ? (
        <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
          {label}
        </ThemedText>
      ) : null}
      <View style={styles.chart}>
        {data.map((item, index) => {
          const height = (item.value / max) * 80;
          return (
            <View key={index} style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(height, 4),
                    backgroundColor: item.completed ? chartColor : theme.border,
                  },
                ]}
              />
              <ThemedText
                type="small"
                style={[styles.dayLabel, { color: theme.textSecondary }]}
              >
                {item.day}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
  },
  label: {
    marginBottom: Spacing.sm,
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 100,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    width: 24,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  dayLabel: {
    fontSize: 10,
  },
});
