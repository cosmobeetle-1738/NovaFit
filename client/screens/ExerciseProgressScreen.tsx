import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/lib/store";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { CalendarStackParamList } from "@/navigation/CalendarStackNavigator";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHART_HEIGHT = 200;
const CHART_PADDING = 40;

type ExerciseProgressRouteProp = RouteProp<CalendarStackParamList, "ExerciseProgress">;

interface DataPoint {
  date: string;
  maxWeight: number;
  totalVolume: number;
  avgReps: number;
  totalSets: number;
  totalReps: number;
}

export default function ExerciseProgressScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const route = useRoute<ExerciseProgressRouteProp>();
  const { exerciseName } = route.params;
  const store = useStore();

  const progressData = useMemo(() => {
    const exerciseLogs = store.workoutLogs
      .flatMap((log) =>
        log.exerciseLogs
          .filter((el) => el.name === exerciseName)
          .map((el) => ({
            date: new Date(log.completedAt).toISOString().split("T")[0],
            completedAt: log.completedAt,
            sets: el.sets.filter((s) => s.completed),
          }))
      )
      .sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());

    const dataPoints: DataPoint[] = exerciseLogs.map((log) => ({
      date: log.date,
      maxWeight: Math.max(...log.sets.map((s) => s.weight), 0),
      totalVolume: log.sets.reduce((sum, s) => sum + s.weight * s.reps, 0),
      avgReps: log.sets.length > 0
        ? Math.round(log.sets.reduce((sum, s) => sum + s.reps, 0) / log.sets.length)
        : 0,
      totalSets: log.sets.length,
      totalReps: log.sets.reduce((sum, s) => sum + s.reps, 0),
    }));

    return dataPoints;
  }, [exerciseName, store.workoutLogs]);

  const isBodyweightExercise = useMemo(() => {
    const exerciseLogs = store.workoutLogs.flatMap((log) =>
      log.exerciseLogs.filter((el) => el.name === exerciseName)
    );
    if (exerciseLogs.length === 0) return false;
    const hasBodyweightFlag = exerciseLogs.some((el) => el.isBodyweight === true);
    if (hasBodyweightFlag) return true;
    const allMaxWeights = progressData.map(d => d.maxWeight);
    return allMaxWeights.every(w => w === 0);
  }, [exerciseName, store.workoutLogs, progressData]);

  const stats = useMemo(() => {
    if (progressData.length === 0) {
      return { currentMax: 0, startMax: 0, improvement: 0, totalSessions: 0, currentReps: 0, startReps: 0, repsImprovement: 0 };
    }

    const currentMax = progressData[progressData.length - 1].maxWeight;
    const startMax = progressData[0].maxWeight;
    const improvement = startMax > 0 ? ((currentMax - startMax) / startMax) * 100 : 0;

    const currentReps = progressData[progressData.length - 1].totalReps;
    const startReps = progressData[0].totalReps;
    const repsImprovement = startReps > 0 ? ((currentReps - startReps) / startReps) * 100 : 0;

    return {
      currentMax,
      startMax,
      improvement,
      totalSessions: progressData.length,
      currentReps,
      startReps,
      repsImprovement,
    };
  }, [progressData]);

  const renderChart = (
    data: number[],
    color: string,
    label: string,
    unit: string
  ) => {
    if (data.length === 0) return null;

    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;
    const chartWidth = SCREEN_WIDTH - Spacing.lg * 2 - Spacing.lg * 2;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1 || 1)) * (chartWidth - CHART_PADDING * 2) + CHART_PADDING;
      const y = CHART_HEIGHT - ((value - minValue) / range) * (CHART_HEIGHT - 40) - 20;
      return { x, y, value };
    });

    return (
      <Card style={styles.chartCard}>
        <Text style={[styles.chartLabel, { color: theme.text }]}>{label}</Text>
        <View style={styles.chartContainer}>
          <View style={styles.yAxis}>
            <Text style={[styles.axisText, { color: theme.textSecondary }]}>
              {maxValue}{unit}
            </Text>
            <Text style={[styles.axisText, { color: theme.textSecondary }]}>
              {minValue}{unit}
            </Text>
          </View>
          <View style={[styles.chart, { height: CHART_HEIGHT }]}>
            {points.map((point, index) => (
              <View
                key={index}
                style={[
                  styles.dataPoint,
                  {
                    left: point.x - 6,
                    top: point.y - 6,
                    backgroundColor: color,
                  },
                ]}
              />
            ))}
            {points.length > 1 && (
              <View style={styles.lineContainer}>
                {points.slice(0, -1).map((point, index) => {
                  const nextPoint = points[index + 1];
                  const dx = nextPoint.x - point.x;
                  const dy = nextPoint.y - point.y;
                  const length = Math.sqrt(dx * dx + dy * dy);
                  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                  return (
                    <View
                      key={index}
                      style={[
                        styles.line,
                        {
                          left: point.x,
                          top: point.y,
                          width: length,
                          backgroundColor: color,
                          transform: [{ rotate: `${angle}deg` }],
                        },
                      ]}
                    />
                  );
                })}
              </View>
            )}
          </View>
        </View>
        <View style={styles.xAxisLabels}>
          {progressData.length > 0 && (
            <>
              <Text style={[styles.axisText, { color: theme.textSecondary }]}>
                {new Date(progressData[0].date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </Text>
              <Text style={[styles.axisText, { color: theme.textSecondary }]}>
                {new Date(progressData[progressData.length - 1].date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </Text>
            </>
          )}
        </View>
      </Card>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      paddingTop: headerHeight + Spacing.lg,
      paddingBottom: insets.bottom + Spacing.xl,
      paddingHorizontal: Spacing.lg,
    },
    header: {
      marginBottom: Spacing.xl,
    },
    exerciseName: {
      ...Typography.h2,
      color: theme.text,
      marginBottom: Spacing.sm,
    },
    sessionsText: {
      ...Typography.body,
      color: theme.textSecondary,
    },
    statsRow: {
      flexDirection: "row",
      gap: Spacing.md,
      marginBottom: Spacing.xl,
    },
    statCard: {
      flex: 1,
      alignItems: "center",
      padding: Spacing.lg,
    },
    statValue: {
      ...Typography.h2,
      color: theme.primary,
      marginBottom: Spacing.xs,
    },
    statLabel: {
      ...Typography.caption,
      color: theme.textSecondary,
      textAlign: "center",
    },
    improvementBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: stats.improvement >= 0 ? theme.primary + "20" : theme.error + "20",
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      borderRadius: BorderRadius.full,
      marginTop: Spacing.sm,
    },
    improvementText: {
      ...Typography.small,
      color: stats.improvement >= 0 ? theme.primary : theme.error,
      fontWeight: "600",
      marginLeft: Spacing.xs,
    },
    chartCard: {
      marginBottom: Spacing.lg,
      padding: Spacing.lg,
    },
    chartLabel: {
      ...Typography.h4,
      marginBottom: Spacing.md,
    },
    chartContainer: {
      flexDirection: "row",
    },
    yAxis: {
      justifyContent: "space-between",
      paddingVertical: 10,
      marginRight: Spacing.sm,
    },
    chart: {
      flex: 1,
      position: "relative",
    },
    dataPoint: {
      position: "absolute",
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    lineContainer: {
      position: "absolute",
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    },
    line: {
      position: "absolute",
      height: 2,
      transformOrigin: "left center",
    },
    xAxisLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: CHART_PADDING,
      marginTop: Spacing.sm,
    },
    axisText: {
      ...Typography.caption,
    },
    emptyState: {
      alignItems: "center",
      padding: Spacing["3xl"],
    },
    emptyText: {
      ...Typography.body,
      color: theme.textSecondary,
      marginTop: Spacing.md,
      textAlign: "center",
    },
    historySection: {
      marginTop: Spacing.lg,
    },
    sectionTitle: {
      ...Typography.h4,
      color: theme.text,
      marginBottom: Spacing.md,
    },
    historyItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    historyDate: {
      ...Typography.body,
      color: theme.text,
    },
    historyStats: {
      flexDirection: "row",
      gap: Spacing.lg,
    },
    historyStat: {
      alignItems: "flex-end",
    },
    historyValue: {
      ...Typography.body,
      fontWeight: "600",
      color: theme.text,
    },
    historyLabel: {
      ...Typography.caption,
      color: theme.textSecondary,
    },
  });

  if (progressData.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.emptyState}>
            <Feather name="trending-up" size={48} color={theme.textSecondary} />
            <Text style={styles.emptyText}>
              No progress data yet for {exerciseName}.{"\n"}
              Complete some workouts to track your progress!
            </Text>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.exerciseName}>{exerciseName}</Text>
          <Text style={styles.sessionsText}>
            {stats.totalSessions} workout{stats.totalSessions !== 1 ? "s" : ""} logged
          </Text>
        </View>

        {isBodyweightExercise ? (
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{stats.currentReps}</Text>
              <Text style={styles.statLabel}>CURRENT REPS</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{stats.startReps}</Text>
              <Text style={styles.statLabel}>STARTING REPS</Text>
              {stats.repsImprovement !== 0 && (
                <View style={styles.improvementBadge}>
                  <Feather
                    name={stats.repsImprovement >= 0 ? "trending-up" : "trending-down"}
                    size={14}
                    color={stats.repsImprovement >= 0 ? theme.primary : theme.error}
                  />
                  <Text style={styles.improvementText}>
                    {stats.repsImprovement >= 0 ? "+" : ""}
                    {stats.repsImprovement.toFixed(1)}%
                  </Text>
                </View>
              )}
            </Card>
          </View>
        ) : (
          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{stats.currentMax}</Text>
              <Text style={styles.statLabel}>CURRENT MAX (LBS)</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{stats.startMax}</Text>
              <Text style={styles.statLabel}>STARTING (LBS)</Text>
              {stats.improvement !== 0 && (
                <View style={styles.improvementBadge}>
                  <Feather
                    name={stats.improvement >= 0 ? "trending-up" : "trending-down"}
                    size={14}
                    color={stats.improvement >= 0 ? theme.primary : theme.error}
                  />
                  <Text style={styles.improvementText}>
                    {stats.improvement >= 0 ? "+" : ""}
                    {stats.improvement.toFixed(1)}%
                  </Text>
                </View>
              )}
            </Card>
          </View>
        )}

        {isBodyweightExercise ? (
          <>
            {renderChart(
              progressData.map((d) => d.totalReps),
              theme.primary,
              "Total Reps",
              ""
            )}
            {renderChart(
              progressData.map((d) => d.totalSets),
              theme.carbs,
              "Total Sets",
              ""
            )}
          </>
        ) : (
          <>
            {renderChart(
              progressData.map((d) => d.maxWeight),
              theme.primary,
              "Max Weight",
              "lb"
            )}
            {renderChart(
              progressData.map((d) => d.totalVolume),
              theme.carbs,
              "Total Volume",
              ""
            )}
          </>
        )}

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Session History</Text>
          <Card>
            {progressData.slice().reverse().map((session, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyDate}>
                  {new Date(session.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
                <View style={styles.historyStats}>
                  {isBodyweightExercise ? (
                    <>
                      <View style={styles.historyStat}>
                        <Text style={styles.historyValue}>{session.totalSets}</Text>
                        <Text style={styles.historyLabel}>SETS</Text>
                      </View>
                      <View style={styles.historyStat}>
                        <Text style={styles.historyValue}>{session.totalReps}</Text>
                        <Text style={styles.historyLabel}>REPS</Text>
                      </View>
                      <View style={styles.historyStat}>
                        <Text style={styles.historyValue}>{session.avgReps}</Text>
                        <Text style={styles.historyLabel}>AVG/SET</Text>
                      </View>
                    </>
                  ) : (
                    <>
                      <View style={styles.historyStat}>
                        <Text style={styles.historyValue}>{session.maxWeight}lb</Text>
                        <Text style={styles.historyLabel}>MAX</Text>
                      </View>
                      <View style={styles.historyStat}>
                        <Text style={styles.historyValue}>{session.avgReps}</Text>
                        <Text style={styles.historyLabel}>AVG REPS</Text>
                      </View>
                      <View style={styles.historyStat}>
                        <Text style={styles.historyValue}>{session.totalVolume}</Text>
                        <Text style={styles.historyLabel}>VOLUME</Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
