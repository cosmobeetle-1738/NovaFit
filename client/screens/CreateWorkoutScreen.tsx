import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useStore, Exercise } from "@/lib/store";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { WorkoutsStackParamList } from "@/navigation/WorkoutsStackNavigator";

type Navigation = NativeStackNavigationProp<WorkoutsStackParamList>;
type Route = RouteProp<WorkoutsStackParamList, "CreateWorkout">;

const colors = ["#FF6B35", "#4ECDC4", "#FFE66D", "#FF6B6B", "#4CAF50", "#2196F3"];
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CreateWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { theme } = useTheme();
  const store = useStore();

  const existingWorkout = route.params?.workoutId
    ? store.workouts.find((w) => w.id === route.params?.workoutId)
    : null;

  const [name, setName] = useState(existingWorkout?.name || "");
  const [selectedColor, setSelectedColor] = useState(
    existingWorkout?.color || colors[0]
  );
  const [scheduledDays, setScheduledDays] = useState<number[]>(
    existingWorkout?.scheduledDays || []
  );
  const [exercises, setExercises] = useState<Omit<Exercise, "id">[]>(
    existingWorkout?.exercises.map((e) => ({
      name: e.name,
      sets: e.sets,
      reps: e.reps,
      weight: e.weight,
      isBodyweight: e.isBodyweight || false,
      notes: e.notes,
    })) || []
  );

  const toggleDay = (day: number) => {
    setScheduledDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const addExercise = () => {
    setExercises([
      ...exercises,
      { name: "", sets: 3, reps: 10, weight: 0, isBodyweight: false },
    ]);
  };

  const updateExercise = (index: number, updates: Partial<Exercise>) => {
    setExercises((prev) =>
      prev.map((e, i) => (i === index ? { ...e, ...updates } : e))
    );
  };

  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const workoutData = {
      name: name.trim(),
      color: selectedColor,
      scheduledDays,
      exercises: exercises
        .filter((e) => e.name.trim())
        .map((e, i) => ({ ...e, id: String(i) })),
    };

    if (existingWorkout) {
      store.updateWorkout(existingWorkout.id, workoutData);
    } else {
      store.addWorkout(workoutData);
    }

    navigation.goBack();
  };

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
        <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
          Workout Name
        </ThemedText>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g., Upper Body"
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
          Color
        </ThemedText>
        <View style={styles.colorRow}>
          {colors.map((color) => (
            <Pressable
              key={color}
              onPress={() => setSelectedColor(color)}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                selectedColor === color && styles.colorSelected,
              ]}
            >
              {selectedColor === color ? (
                <Feather name="check" size={16} color="#FFF" />
              ) : null}
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
          Schedule
        </ThemedText>
        <View style={styles.daysRow}>
          {dayNames.map((day, index) => (
            <Pressable
              key={day}
              onPress={() => toggleDay(index)}
              style={[
                styles.dayButton,
                {
                  backgroundColor: scheduledDays.includes(index)
                    ? theme.primary
                    : theme.backgroundDefault,
                },
              ]}
            >
              <ThemedText
                type="small"
                style={{
                  color: scheduledDays.includes(index) ? "#FFF" : theme.text,
                  fontWeight: "600",
                }}
              >
                {day.slice(0, 1)}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <View style={styles.exercisesHeader}>
          <ThemedText type="h4">Exercises</ThemedText>
          <Pressable onPress={addExercise} style={styles.addExerciseButton}>
            <Feather name="plus" size={18} color={theme.primary} />
            <ThemedText type="small" style={{ color: theme.primary, marginLeft: 4 }}>
              Add
            </ThemedText>
          </Pressable>
        </View>

        {exercises.map((exercise, index) => (
          <Card key={index} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <TextInput
                value={exercise.name}
                onChangeText={(text) => updateExercise(index, { name: text })}
                placeholder="Exercise name"
                placeholderTextColor={theme.textSecondary}
                style={[styles.exerciseNameInput, { color: theme.text }]}
              />
              <Pressable
                onPress={() => removeExercise(index)}
                style={styles.removeButton}
              >
                <Feather name="x" size={18} color={theme.error} />
              </Pressable>
            </View>
            <Pressable
              onPress={() => updateExercise(index, { isBodyweight: !exercise.isBodyweight, weight: 0 })}
              style={styles.bodyweightRow}
            >
              <View
                style={[
                  styles.bodyweightToggle,
                  {
                    backgroundColor: exercise.isBodyweight
                      ? theme.primary
                      : theme.backgroundDefault,
                    borderColor: exercise.isBodyweight ? theme.primary : theme.border,
                  },
                ]}
              >
                {exercise.isBodyweight ? (
                  <Feather name="check" size={12} color="#FFF" />
                ) : null}
              </View>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Bodyweight exercise (no weights)
              </ThemedText>
            </Pressable>
            <View style={styles.exerciseDetails}>
              <View style={styles.detailField}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Sets
                </ThemedText>
                <TextInput
                  value={String(exercise.sets)}
                  onChangeText={(text) =>
                    updateExercise(index, { sets: parseInt(text) || 0 })
                  }
                  keyboardType="number-pad"
                  style={[
                    styles.detailInput,
                    { backgroundColor: theme.backgroundDefault, color: theme.text },
                  ]}
                />
              </View>
              <View style={styles.detailField}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Reps
                </ThemedText>
                <TextInput
                  value={String(exercise.reps)}
                  onChangeText={(text) =>
                    updateExercise(index, { reps: parseInt(text) || 0 })
                  }
                  keyboardType="number-pad"
                  style={[
                    styles.detailInput,
                    { backgroundColor: theme.backgroundDefault, color: theme.text },
                  ]}
                />
              </View>
              {exercise.isBodyweight ? null : (
                <View style={styles.detailField}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Weight
                  </ThemedText>
                  <TextInput
                    value={String(exercise.weight)}
                    onChangeText={(text) =>
                      updateExercise(index, { weight: parseFloat(text) || 0 })
                    }
                    keyboardType="decimal-pad"
                    style={[
                      styles.detailInput,
                      { backgroundColor: theme.backgroundDefault, color: theme.text },
                    ]}
                  />
                </View>
              )}
            </View>
          </Card>
        ))}

        {exercises.length === 0 ? (
          <Pressable
            onPress={addExercise}
            style={[styles.emptyExercises, { borderColor: theme.border }]}
          >
            <Feather name="plus" size={24} color={theme.textSecondary} />
            <ThemedText
              type="body"
              style={{ color: theme.textSecondary, marginTop: Spacing.sm }}
            >
              Add your first exercise
            </ThemedText>
          </Pressable>
        ) : null}
      </View>

      <Button onPress={handleSave} disabled={!name.trim()}>
        {existingWorkout ? "Update Workout" : "Create Workout"}
      </Button>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: Spacing.xl,
  },
  label: {
    marginBottom: Spacing.sm,
  },
  input: {
    height: Spacing.inputHeight,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  colorRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: "#FFF",
  },
  daysRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  exercisesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  addExerciseButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  exerciseCard: {
    marginBottom: Spacing.md,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  exerciseNameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  removeButton: {
    padding: Spacing.xs,
  },
  exerciseDetails: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  detailField: {
    flex: 1,
  },
  detailInput: {
    height: 40,
    borderRadius: BorderRadius.sm,
    textAlign: "center",
    marginTop: Spacing.xs,
    fontSize: 16,
  },
  emptyExercises: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: BorderRadius.md,
  },
  bodyweightRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  bodyweightToggle: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.xs,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
});
