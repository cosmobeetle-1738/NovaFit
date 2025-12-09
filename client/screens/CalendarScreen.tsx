import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useStore, WorkoutLog, FoodEntry } from "@/lib/store";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { LineGraph } from "@/components/LineGraph";
import { CalendarStackParamList } from "@/navigation/CalendarStackNavigator";

type CalendarNavigationProp = NativeStackNavigationProp<CalendarStackParamList, "Calendar">;

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface DayData {
  date: string;
  workouts: WorkoutLog[];
  nutrition: { calories: number; protein: number; carbs: number; fats: number };
  hasWorkout: boolean;
  hasNutrition: boolean;
}

export default function CalendarScreen() {
  const { theme, isDark } = useTheme();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<CalendarNavigationProp>();
  const store = useStore();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);

  const handleExercisePress = (exerciseName: string) => {
    setShowDayModal(false);
    navigation.navigate("ExerciseProgress", { exerciseName });
  };

  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (DayData | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayWorkouts = store.workoutLogs.filter((log) => {
        const logDate = new Date(log.completedAt).toISOString().split("T")[0];
        return logDate === dateStr;
      });
      const nutrition = store.getDailyNutrition(dateStr);

      days.push({
        date: dateStr,
        workouts: dayWorkouts,
        nutrition,
        hasWorkout: dayWorkouts.length > 0,
        hasNutrition: nutrition.calories > 0,
      });
    }

    return days;
  }, [currentMonth, store.workoutLogs, store.foodEntries]);

  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;
    return calendarData.find((d) => d?.date === selectedDate) || null;
  }, [selectedDate, calendarData]);

  const nutritionTrendData = useMemo(() => {
    const days: { date: string; value: number; label: string }[] = [];
    const today = new Date();
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const nutrition = store.getDailyNutrition(dateStr);
      
      if (nutrition.calories > 0) {
        days.push({
          date: dateStr,
          value: Math.round(nutrition.calories),
          label: `${date.getMonth() + 1}/${date.getDate()}`,
        });
      }
    }
    
    return days;
  }, [store.foodEntries]);

  const exerciseProgress = useMemo(() => {
    if (!selectedDayData?.workouts.length) return [];

    const progress: {
      exerciseName: string;
      currentMax: number;
      previousMax: number;
      improvement: number;
      sets: { reps: number; weight: number }[];
    }[] = [];

    selectedDayData.workouts.forEach((workout) => {
      workout.exerciseLogs.forEach((exerciseLog) => {
        const previousLogs = store.workoutLogs
          .filter((log) => {
            const logDate = new Date(log.completedAt).toISOString().split("T")[0];
            return logDate < selectedDate!;
          })
          .flatMap((log) => log.exerciseLogs)
          .filter((el) => el.name === exerciseLog.name);

        const currentMax = Math.max(
          ...exerciseLog.sets.filter((s) => s.completed).map((s) => s.weight),
          0
        );
        const previousMax = previousLogs.length > 0
          ? Math.max(
              ...previousLogs.flatMap((el) =>
                el.sets.filter((s) => s.completed).map((s) => s.weight)
              ),
              0
            )
          : 0;

        progress.push({
          exerciseName: exerciseLog.name,
          currentMax,
          previousMax,
          improvement: previousMax > 0 ? ((currentMax - previousMax) / previousMax) * 100 : 0,
          sets: exerciseLog.sets.filter((s) => s.completed),
        });
      });
    });

    return progress;
  }, [selectedDayData, store.workoutLogs, selectedDate]);

  const navigateMonth = (direction: number) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const handleDayPress = (date: string) => {
    setSelectedDate(date);
    setShowDayModal(true);
  };

  const today = new Date().toISOString().split("T")[0];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      paddingTop: headerHeight + Spacing.lg,
      paddingBottom: tabBarHeight + Spacing.xl,
      paddingHorizontal: Spacing.lg,
    },
    monthHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: Spacing.xl,
    },
    monthTitle: {
      ...Typography.h2,
      color: theme.text,
    },
    navButton: {
      padding: Spacing.sm,
    },
    weekHeader: {
      flexDirection: "row",
      marginBottom: Spacing.sm,
    },
    weekDay: {
      flex: 1,
      textAlign: "center",
      ...Typography.caption,
      color: theme.textSecondary,
    },
    calendarGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    dayCell: {
      width: "14.28%",
      aspectRatio: 1,
      padding: 2,
    },
    dayInner: {
      flex: 1,
      borderRadius: BorderRadius.sm,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.backgroundSecondary,
    },
    dayInnerToday: {
      borderWidth: 2,
      borderColor: theme.primary,
    },
    dayInnerSelected: {
      backgroundColor: theme.primary,
    },
    dayNumber: {
      ...Typography.body,
      color: theme.text,
    },
    dayNumberSelected: {
      color: "#FFFFFF",
    },
    indicators: {
      flexDirection: "row",
      marginTop: 2,
    },
    indicator: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginHorizontal: 1,
    },
    workoutIndicator: {
      backgroundColor: Colors.light.primary,
    },
    nutritionIndicator: {
      backgroundColor: Colors.light.carbs,
    },
    emptyDay: {
      backgroundColor: "transparent",
    },
    legendContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: Spacing.xl,
      gap: Spacing.lg,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.xs,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    legendText: {
      ...Typography.small,
      color: theme.textSecondary,
    },
    trendsCard: {
      marginTop: Spacing.xl,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: theme.backgroundRoot,
      borderTopLeftRadius: BorderRadius.xl,
      borderTopRightRadius: BorderRadius.xl,
      maxHeight: "80%",
      paddingBottom: Spacing["3xl"],
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    modalTitle: {
      ...Typography.h3,
      color: theme.text,
    },
    closeButton: {
      padding: Spacing.sm,
    },
    modalScroll: {
      padding: Spacing.lg,
    },
    section: {
      marginBottom: Spacing.xl,
    },
    sectionTitle: {
      ...Typography.h4,
      color: theme.text,
      marginBottom: Spacing.md,
    },
    workoutCard: {
      marginBottom: Spacing.md,
    },
    workoutName: {
      ...Typography.body,
      fontWeight: "600",
      color: theme.text,
      marginBottom: Spacing.sm,
    },
    workoutDuration: {
      ...Typography.small,
      color: theme.textSecondary,
    },
    exerciseItem: {
      marginTop: Spacing.md,
      paddingTop: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    exerciseHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: Spacing.xs,
    },
    exerciseName: {
      ...Typography.body,
      color: theme.text,
      flex: 1,
    },
    exerciseStats: {
      flexDirection: "row",
      gap: Spacing.lg,
    },
    statItem: {
      alignItems: "center",
    },
    statValue: {
      ...Typography.h4,
      color: theme.primary,
    },
    statLabel: {
      ...Typography.caption,
      color: theme.textSecondary,
    },
    improvementBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.primary + "20",
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.full,
      alignSelf: "flex-start",
      marginTop: Spacing.sm,
    },
    improvementText: {
      ...Typography.small,
      color: theme.primary,
      fontWeight: "600",
      marginLeft: Spacing.xs,
    },
    nutritionSummary: {
      gap: Spacing.md,
    },
    nutritionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    nutritionLabel: {
      ...Typography.body,
      color: theme.text,
    },
    nutritionValue: {
      ...Typography.body,
      fontWeight: "600",
      color: theme.text,
    },
    macroRow: {
      flexDirection: "row",
      gap: Spacing.md,
      marginTop: Spacing.md,
    },
    macroItem: {
      flex: 1,
    },
    macroLabel: {
      ...Typography.caption,
      color: theme.textSecondary,
      marginBottom: Spacing.xs,
    },
    macroValue: {
      ...Typography.body,
      fontWeight: "600",
    },
    emptyState: {
      alignItems: "center",
      padding: Spacing.xl,
    },
    emptyText: {
      ...Typography.body,
      color: theme.textSecondary,
      marginTop: Spacing.md,
    },
    setsList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.sm,
      marginTop: Spacing.sm,
    },
    setChip: {
      backgroundColor: theme.backgroundTertiary,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.sm,
    },
    setChipText: {
      ...Typography.small,
      color: theme.text,
    },
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.monthHeader}>
          <Pressable style={styles.navButton} onPress={() => navigateMonth(-1)}>
            <Feather name="chevron-left" size={24} color={theme.text} />
          </Pressable>
          <Text style={styles.monthTitle}>
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          <Pressable style={styles.navButton} onPress={() => navigateMonth(1)}>
            <Feather name="chevron-right" size={24} color={theme.text} />
          </Pressable>
        </View>

        <View style={styles.weekHeader}>
          {DAYS.map((day) => (
            <Text key={day} style={styles.weekDay}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {calendarData.map((day, index) => (
            <View key={index} style={styles.dayCell}>
              {day ? (
                <Pressable
                  style={[
                    styles.dayInner,
                    day.date === today && styles.dayInnerToday,
                    day.date === selectedDate && styles.dayInnerSelected,
                  ]}
                  onPress={() => handleDayPress(day.date)}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      day.date === selectedDate && styles.dayNumberSelected,
                    ]}
                  >
                    {parseInt(day.date.split("-")[2])}
                  </Text>
                  <View style={styles.indicators}>
                    {day.hasWorkout && (
                      <View style={[styles.indicator, styles.workoutIndicator]} />
                    )}
                    {day.hasNutrition && (
                      <View style={[styles.indicator, styles.nutritionIndicator]} />
                    )}
                  </View>
                </Pressable>
              ) : (
                <View style={[styles.dayInner, styles.emptyDay]} />
              )}
            </View>
          ))}
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.workoutIndicator]} />
            <Text style={styles.legendText}>Workout</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.nutritionIndicator]} />
            <Text style={styles.legendText}>Nutrition</Text>
          </View>
        </View>

        {nutritionTrendData.length >= 2 ? (
          <Card style={styles.trendsCard}>
            <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
              Calorie Trends (Last 14 Days)
            </ThemedText>
            <LineGraph
              data={nutritionTrendData}
              color={theme.primary}
              height={150}
              showDots={true}
              showLabels={true}
              unit=" cal"
            />
          </Card>
        ) : null}
      </ScrollView>

      <Modal
        visible={showDayModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDayModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDate ? formatDate(selectedDate) : ""}
              </Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => setShowDayModal(false)}
              >
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              {selectedDayData?.hasWorkout && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Workouts</Text>
                  {selectedDayData.workouts.map((workout, idx) => (
                    <Card key={idx} style={styles.workoutCard}>
                      <Text style={styles.workoutName}>{workout.workoutName}</Text>
                      <Text style={styles.workoutDuration}>
                        {workout.duration} min
                      </Text>

                      {exerciseProgress.map((exercise, exIdx) => (
                        <Pressable
                          key={exIdx}
                          style={styles.exerciseItem}
                          onPress={() => handleExercisePress(exercise.exerciseName)}
                        >
                          <View style={styles.exerciseHeader}>
                            <Text style={styles.exerciseName}>
                              {exercise.exerciseName}
                            </Text>
                            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
                          </View>
                          <View style={styles.exerciseStats}>
                            <View style={styles.statItem}>
                              <Text style={styles.statValue}>
                                {exercise.currentMax}
                              </Text>
                              <Text style={styles.statLabel}>MAX LBS</Text>
                            </View>
                            <View style={styles.statItem}>
                              <Text style={styles.statValue}>
                                {exercise.sets.length}
                              </Text>
                              <Text style={styles.statLabel}>SETS</Text>
                            </View>
                            <View style={styles.statItem}>
                              <Text style={styles.statValue}>
                                {exercise.sets.reduce((sum, s) => sum + s.reps, 0)}
                              </Text>
                              <Text style={styles.statLabel}>TOTAL REPS</Text>
                            </View>
                          </View>
                          {exercise.improvement > 0 && (
                            <View style={styles.improvementBadge}>
                              <Feather name="trending-up" size={14} color={theme.primary} />
                              <Text style={styles.improvementText}>
                                +{exercise.improvement.toFixed(1)}% from previous
                              </Text>
                            </View>
                          )}
                          <View style={styles.setsList}>
                            {exercise.sets.map((set, setIdx) => (
                              <View key={setIdx} style={styles.setChip}>
                                <Text style={styles.setChipText}>
                                  {set.weight}lb x {set.reps}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </Pressable>
                      ))}
                    </Card>
                  ))}
                </View>
              )}

              {selectedDayData?.hasNutrition && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Nutrition</Text>
                  <Card>
                    <View style={styles.nutritionSummary}>
                      <View style={styles.nutritionRow}>
                        <Text style={styles.nutritionLabel}>Calories</Text>
                        <Text style={styles.nutritionValue}>
                          {Math.round(selectedDayData.nutrition.calories)} kcal
                        </Text>
                      </View>
                      <ProgressBar
                        progress={Math.min(1, selectedDayData.nutrition.calories / (store.profile.goals?.dailyCalories || 2000))}
                        color={theme.primary}
                      />
                      <View style={styles.macroRow}>
                        <View style={styles.macroItem}>
                          <Text style={styles.macroLabel}>PROTEIN</Text>
                          <Text style={[styles.macroValue, { color: theme.protein }]}>
                            {Math.round(selectedDayData.nutrition.protein)}g
                          </Text>
                          <ProgressBar
                            progress={Math.min(1, selectedDayData.nutrition.protein / (store.profile.goals?.dailyProtein || 150))}
                            color={theme.protein}
                          />
                        </View>
                        <View style={styles.macroItem}>
                          <Text style={styles.macroLabel}>CARBS</Text>
                          <Text style={[styles.macroValue, { color: theme.carbs }]}>
                            {Math.round(selectedDayData.nutrition.carbs)}g
                          </Text>
                          <ProgressBar
                            progress={Math.min(1, selectedDayData.nutrition.carbs / (store.profile.goals?.dailyCarbs || 250))}
                            color={theme.carbs}
                          />
                        </View>
                        <View style={styles.macroItem}>
                          <Text style={styles.macroLabel}>FATS</Text>
                          <Text style={[styles.macroValue, { color: theme.fats }]}>
                            {Math.round(selectedDayData.nutrition.fats)}g
                          </Text>
                          <ProgressBar
                            progress={Math.min(1, selectedDayData.nutrition.fats / (store.profile.goals?.dailyFats || 65))}
                            color={theme.fats}
                          />
                        </View>
                      </View>
                    </View>
                  </Card>
                </View>
              )}

              {!selectedDayData?.hasWorkout && !selectedDayData?.hasNutrition && (
                <View style={styles.emptyState}>
                  <Feather name="calendar" size={48} color={theme.textSecondary} />
                  <Text style={styles.emptyText}>No activity logged for this day</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}
