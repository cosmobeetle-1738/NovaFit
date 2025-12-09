import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface StatCardProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  onPress?: () => void;
}

export function StatCard({
  icon,
  label,
  value,
  subtitle,
  color,
  onPress,
}: StatCardProps) {
  const { theme } = useTheme();
  const iconColor = color || theme.primary;

  return (
    <Card style={styles.container} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
        <Feather name={icon} size={20} color={iconColor} />
      </View>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>
        {label}
      </ThemedText>
      <ThemedText type="h3">{value}</ThemedText>
      {subtitle ? (
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {subtitle}
        </ThemedText>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
});
