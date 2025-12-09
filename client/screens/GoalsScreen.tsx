import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { WeeklyChart } from "@/components/WeeklyChart";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/lib/store";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const store = useStore();

  const [goals, setGoals] = useState({
    dailyCalories: String(store.profile.goals.dailyCalories),
    dailyProtein: String(store.profile.goals.dailyProtein),
    dailyCarbs: String(store.profile.goals.dailyCarbs),
    dailyFats: String(store.profile.goals.dailyFats),
    weeklyWorkouts: String(store.profile.goals.weeklyWorkouts),
    targetWeight: String(store.profile.goals.targetWeight),
  });

  const [newWeight, setNewWeight] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const handleSave = () => {
    store.updateProfile({
      goals: {
        dailyCalories: parseInt(goals.dailyCalories) || 0,
        dailyProtein: parseInt(goals.dailyProtein) || 0,
        dailyCarbs: parseInt(goals.dailyCarbs) || 0,
        dailyFats: parseInt(goals.dailyFats) || 0,
        weeklyWorkouts: parseInt(goals.weeklyWorkouts) || 0,
        targetWeight: parseFloat(goals.targetWeight) || 0,
      },
    });
    navigation.goBack();
  };

  const handleLogWeight = () => {
    if (!newWeight) return;
    store.addWeightEntry(parseFloat(newWeight), today);
    setNewWeight("");
  };

  const weightData = store.weightEntries.slice(-7).map((entry) => ({
    day: new Date(entry.date).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1),
    value: entry.weight,
    completed: true,
  }));

  const latestWeight = store.weightEntries[store.weightEntries.length - 1];
  const firstWeight = store.weightEntries[0];
  const weightChange = latestWeight && firstWeight
    ? (latestWeight.weight - firstWeight.weight).toFixed(1)
    : 0;

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
      <Card style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Weight Tracking
        </ThemedText>

        <View style={styles.weightSummary}>
          <View style={styles.weightStat}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Current
            </ThemedText>
            <ThemedText type="h3">
              {latestWeight ? latestWeight.weight : "--"}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {store.profile.units === "imperial" ? "lbs" : "kg"}
            </ThemedText>
          </View>
          <View style={styles.weightStat}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Target
            </ThemedText>
            <ThemedText type="h3">{store.profile.goals.targetWeight}</ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {store.profile.units === "imperial" ? "lbs" : "kg"}
            </ThemedText>
          </View>
          <View style={styles.weightStat}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Change
            </ThemedText>
            <ThemedText
              type="h3"
              style={{
                color:
                  Number(weightChange) < 0 ? theme.success : theme.error,
              }}
            >
              {Number(weightChange) > 0 ? "+" : ""}
              {weightChange}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {store.profile.units === "imperial" ? "lbs" : "kg"}
            </ThemedText>
          </View>
        </View>

        {weightData.length > 0 ? (
          <WeeklyChart
            data={weightData}
            label="Weight History"
            color={theme.info}
          />
        ) : null}

        <View style={styles.logWeightRow}>
          <TextInput
            value={newWeight}
            onChangeText={setNewWeight}
            placeholder="Enter weight"
            placeholderTextColor={theme.textSecondary}
            keyboardType="decimal-pad"
            style={[
              styles.weightInput,
              { backgroundColor: theme.backgroundDefault, color: theme.text },
            ]}
          />
          <Pressable
            onPress={handleLogWeight}
            style={[
              styles.logButton,
              { backgroundColor: newWeight ? theme.primary : theme.backgroundDefault },
            ]}
          >
            <Feather
              name="plus"
              size={20}
              color={newWeight ? "#FFF" : theme.textSecondary}
            />
          </Pressable>
        </View>
      </Card>

      <Card style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Nutrition Goals
        </ThemedText>

        <View style={styles.goalRow}>
          <View style={styles.goalLabel}>
            <View style={[styles.goalDot, { backgroundColor: theme.primary }]} />
            <ThemedText type="body">Daily Calories</ThemedText>
          </View>
          <TextInput
            value={goals.dailyCalories}
            onChangeText={(text) =>
              setGoals({ ...goals, dailyCalories: text })
            }
            keyboardType="number-pad"
            style={[
              styles.goalInput,
              { backgroundColor: theme.backgroundDefault, color: theme.text },
            ]}
          />
        </View>

        <View style={styles.goalRow}>
          <View style={styles.goalLabel}>
            <View style={[styles.goalDot, { backgroundColor: theme.protein }]} />
            <ThemedText type="body">Protein (g)</ThemedText>
          </View>
          <TextInput
            value={goals.dailyProtein}
            onChangeText={(text) => setGoals({ ...goals, dailyProtein: text })}
            keyboardType="number-pad"
            style={[
              styles.goalInput,
              { backgroundColor: theme.backgroundDefault, color: theme.text },
            ]}
          />
        </View>

        <View style={styles.goalRow}>
          <View style={styles.goalLabel}>
            <View style={[styles.goalDot, { backgroundColor: theme.carbs }]} />
            <ThemedText type="body">Carbs (g)</ThemedText>
          </View>
          <TextInput
            value={goals.dailyCarbs}
            onChangeText={(text) => setGoals({ ...goals, dailyCarbs: text })}
            keyboardType="number-pad"
            style={[
              styles.goalInput,
              { backgroundColor: theme.backgroundDefault, color: theme.text },
            ]}
          />
        </View>

        <View style={styles.goalRow}>
          <View style={styles.goalLabel}>
            <View style={[styles.goalDot, { backgroundColor: theme.fats }]} />
            <ThemedText type="body">Fats (g)</ThemedText>
          </View>
          <TextInput
            value={goals.dailyFats}
            onChangeText={(text) => setGoals({ ...goals, dailyFats: text })}
            keyboardType="number-pad"
            style={[
              styles.goalInput,
              { backgroundColor: theme.backgroundDefault, color: theme.text },
            ]}
          />
        </View>
      </Card>

      <Card style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Fitness Goals
        </ThemedText>

        <View style={styles.goalRow}>
          <View style={styles.goalLabel}>
            <View style={[styles.goalDot, { backgroundColor: theme.success }]} />
            <ThemedText type="body">Weekly Workouts</ThemedText>
          </View>
          <TextInput
            value={goals.weeklyWorkouts}
            onChangeText={(text) =>
              setGoals({ ...goals, weeklyWorkouts: text })
            }
            keyboardType="number-pad"
            style={[
              styles.goalInput,
              { backgroundColor: theme.backgroundDefault, color: theme.text },
            ]}
          />
        </View>

        <View style={styles.goalRow}>
          <View style={styles.goalLabel}>
            <View style={[styles.goalDot, { backgroundColor: theme.info }]} />
            <ThemedText type="body">
              Target Weight ({store.profile.units === "imperial" ? "lbs" : "kg"})
            </ThemedText>
          </View>
          <TextInput
            value={goals.targetWeight}
            onChangeText={(text) => setGoals({ ...goals, targetWeight: text })}
            keyboardType="decimal-pad"
            style={[
              styles.goalInput,
              { backgroundColor: theme.backgroundDefault, color: theme.text },
            ]}
          />
        </View>
      </Card>

      <Button onPress={handleSave}>Save Goals</Button>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  weightSummary: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Spacing.lg,
  },
  weightStat: {
    alignItems: "center",
  },
  logWeightRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  weightInput: {
    flex: 1,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  logButton: {
    width: Spacing.inputHeight,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  goalLabel: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  goalInput: {
    width: 80,
    height: 40,
    borderRadius: BorderRadius.sm,
    textAlign: "center",
    fontSize: 16,
  },
});
