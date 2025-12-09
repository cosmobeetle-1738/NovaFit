import React, { useState, useEffect, useRef } from "react";
import { View, ScrollView, StyleSheet, Pressable, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useStore, SetLog, ExerciseLog } from "@/lib/store";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { WorkoutsStackParamList } from "@/navigation/WorkoutsStackNavigator";

type Navigation = NativeStackNavigationProp<WorkoutsStackParamList>;
type Route = RouteProp<WorkoutsStackParamList, "ActiveWorkout">;

export default function ActiveWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { theme } = useTheme();
  const store = useStore();

  const workout = store.workouts.find((w) => w.id === route.params.workoutId);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, SetLog[]>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!workout) return;

    const initialLogs: Record<string, SetLog[]> = {};
    workout.exercises.forEach((ex) => {
      initialLogs[ex.id] = Array.from({ length: ex.sets }, () => ({
        reps: ex.reps,
        weight: ex.isBodyweight ? 0 : ex.weight,
        completed: false,
      }));
    });
    setExerciseLogs(initialLogs);

    timerRef.current = setInterval(() => {
      if (!isPaused) {
        setElapsedSeconds((s) => s + 1);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [workout?.id]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused]);

  if (!workout) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedText>Workout not found</ThemedText>
      </ThemedView>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleSet = (exerciseId: string, setIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExerciseLogs((prev) => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((set, i) =>
        i === setIndex ? { ...set, completed: !set.completed } : set
      ),
    }));
  };

  const updateSetValue = (
    exerciseId: string,
    setIndex: number,
    field: "reps" | "weight",
    value: number
  ) => {
    setExerciseLogs((prev) => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((set, i) =>
        i === setIndex ? { ...set, [field]: value } : set
      ),
    }));
  };

  const getCompletedSets = () => {
    return Object.values(exerciseLogs).reduce(
      (sum, sets) => sum + sets.filter((s) => s.completed).length,
      0
    );
  };

  const getTotalSets = () => {
    return workout.exercises.reduce((sum, ex) => sum + ex.sets, 0);
  };

  const handleFinish = () => {
    const logs: ExerciseLog[] = workout.exercises.map((ex) => ({
      exerciseId: ex.id,
      name: ex.name,
      sets: exerciseLogs[ex.id] || [],
      isBodyweight: ex.isBodyweight || false,
    }));

    store.addWorkoutLog({
      workoutId: workout.id,
      workoutName: workout.name,
      completedAt: new Date(),
      duration: Math.floor(elapsedSeconds / 60),
      exerciseLogs: logs,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: theme.primary, paddingTop: insets.top + Spacing.md },
        ]}
      >
        <View style={styles.headerTop}>
          <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Feather name="x" size={24} color="#FFF" />
          </Pressable>
          <View style={styles.timer}>
            <Feather name="clock" size={18} color="#FFF" />
            <ThemedText type="h3" style={styles.timerText}>
              {formatTime(elapsedSeconds)}
            </ThemedText>
          </View>
          <Pressable
            onPress={() => setIsPaused(!isPaused)}
            style={styles.pauseButton}
          >
            <Feather name={isPaused ? "play" : "pause"} size={24} color="#FFF" />
          </Pressable>
        </View>
        <ThemedText type="h2" style={styles.workoutName}>
          {workout.name}
        </ThemedText>
        <View style={styles.progress}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(getCompletedSets() / getTotalSets()) * 100}%` },
              ]}
            />
          </View>
          <ThemedText type="small" style={styles.progressText}>
            {getCompletedSets()}/{getTotalSets()} sets
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          padding: Spacing.lg,
          paddingBottom: insets.bottom + 140,
        }}
      >
        {workout.exercises.map((exercise) => (
          <Card key={exercise.id} style={styles.exerciseCard}>
            <ThemedText type="h4" style={styles.exerciseName}>
              {exercise.name}
            </ThemedText>
            <View style={styles.setsHeader}>
              <ThemedText type="small" style={[styles.setHeaderText, { width: 40 }]}>
                Set
              </ThemedText>
              <ThemedText type="small" style={[styles.setHeaderText, { flex: 1 }]}>
                Reps
              </ThemedText>
              {exercise.isBodyweight ? null : (
                <ThemedText type="small" style={[styles.setHeaderText, { flex: 1 }]}>
                  Weight
                </ThemedText>
              )}
              <View style={{ width: 44 }} />
            </View>
            {exerciseLogs[exercise.id]?.map((set, index) => (
              <View
                key={index}
                style={[
                  styles.setRow,
                  set.completed && { backgroundColor: `${theme.success}10` },
                ]}
              >
                <View style={styles.setNumber}>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    {index + 1}
                  </ThemedText>
                </View>
                <TextInput
                  value={String(set.reps)}
                  onChangeText={(text) =>
                    updateSetValue(exercise.id, index, "reps", parseInt(text) || 0)
                  }
                  keyboardType="number-pad"
                  style={[
                    styles.setInput,
                    { backgroundColor: theme.backgroundDefault, color: theme.text },
                  ]}
                />
                {exercise.isBodyweight ? null : (
                  <TextInput
                    value={String(set.weight)}
                    onChangeText={(text) =>
                      updateSetValue(exercise.id, index, "weight", parseFloat(text) || 0)
                    }
                    keyboardType="decimal-pad"
                    style={[
                      styles.setInput,
                      { backgroundColor: theme.backgroundDefault, color: theme.text },
                    ]}
                  />
                )}
                <Pressable
                  onPress={() => toggleSet(exercise.id, index)}
                  style={[
                    styles.checkButton,
                    {
                      backgroundColor: set.completed
                        ? theme.success
                        : theme.backgroundDefault,
                    },
                  ]}
                >
                  <Feather
                    name="check"
                    size={18}
                    color={set.completed ? "#FFF" : theme.textSecondary}
                  />
                </Pressable>
              </View>
            ))}
          </Card>
        ))}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.backgroundRoot,
            paddingBottom: insets.bottom + Spacing.lg,
          },
        ]}
      >
        <Button onPress={handleFinish}>Finish Workout</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  timer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timerText: {
    color: "#FFF",
    marginLeft: Spacing.sm,
  },
  pauseButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  workoutName: {
    color: "#FFF",
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  progress: {
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFF",
    borderRadius: 3,
  },
  progressText: {
    color: "#FFF",
    marginTop: Spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  exerciseCard: {
    marginBottom: Spacing.lg,
  },
  exerciseName: {
    marginBottom: Spacing.md,
  },
  setsHeader: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  setHeaderText: {
    color: "#757575",
    textAlign: "center",
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  setNumber: {
    width: 40,
    alignItems: "center",
  },
  setInput: {
    flex: 1,
    height: 40,
    borderRadius: BorderRadius.sm,
    textAlign: "center",
    marginHorizontal: Spacing.xs,
    fontSize: 16,
  },
  checkButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
});
