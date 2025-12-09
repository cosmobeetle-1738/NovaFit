import React, { useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, Circle, Line, Text as SvgText } from "react-native-svg";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface DataPoint {
  date: string;
  value: number;
  label?: string;
}

interface LineGraphProps {
  data: DataPoint[];
  color?: string;
  height?: number;
  showDots?: boolean;
  showLabels?: boolean;
  title?: string;
  unit?: string;
}

export function LineGraph({
  data,
  color,
  height = 150,
  showDots = true,
  showLabels = true,
  title,
  unit = "",
}: LineGraphProps) {
  const { theme } = useTheme();
  const graphColor = color || theme.primary;
  
  const width = Dimensions.get("window").width - Spacing.lg * 2 - Spacing.xl * 2;

  const { path, dots, minValue, maxValue } = useMemo(() => {
    if (data.length === 0) {
      return { path: "", dots: [], minValue: 0, maxValue: 100 };
    }

    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    
    const paddedMin = min - range * 0.1;
    const paddedMax = max + range * 0.1;
    const paddedRange = paddedMax - paddedMin;

    const padding = { top: 20, bottom: 30, left: 10, right: 10 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    const points = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * graphWidth;
      const y = padding.top + graphHeight - ((d.value - paddedMin) / paddedRange) * graphHeight;
      return { x, y, value: d.value, label: d.label || d.date.slice(5) };
    });

    let pathD = "";
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prevPoint = points[i - 1];
        const currPoint = points[i];
        const midX = (prevPoint.x + currPoint.x) / 2;
        pathD += ` C ${midX} ${prevPoint.y}, ${midX} ${currPoint.y}, ${currPoint.x} ${currPoint.y}`;
      }
    }

    return {
      path: pathD,
      dots: points,
      minValue: Math.round(paddedMin),
      maxValue: Math.round(paddedMax),
    };
  }, [data, width, height]);

  if (data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.emptyState}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            No data available
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {title ? (
        <ThemedText type="h4" style={{ marginBottom: Spacing.md }}>
          {title}
        </ThemedText>
      ) : null}
      <View style={[styles.graphContainer, { height }]}>
        <Svg width={width} height={height}>
          <Line
            x1={10}
            y1={height - 30}
            x2={width - 10}
            y2={height - 30}
            stroke={theme.border}
            strokeWidth={1}
          />
          
          <Path
            d={path}
            stroke={graphColor}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {showDots &&
            dots.map((dot, i) => (
              <Circle
                key={i}
                cx={dot.x}
                cy={dot.y}
                r={4}
                fill={graphColor}
                stroke={theme.backgroundRoot}
                strokeWidth={2}
              />
            ))}

          {showLabels &&
            dots.map((dot, i) => {
              if (dots.length <= 7 || i === 0 || i === dots.length - 1 || i % Math.ceil(dots.length / 7) === 0) {
                return (
                  <SvgText
                    key={`label-${i}`}
                    x={dot.x}
                    y={height - 10}
                    fontSize={10}
                    fill={theme.textSecondary}
                    textAnchor="middle"
                  >
                    {dot.label}
                  </SvgText>
                );
              }
              return null;
            })}
        </Svg>
      </View>
      <View style={styles.legend}>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {minValue}{unit}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {maxValue}{unit}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  graphContainer: {
    width: "100%",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.xs,
  },
});
