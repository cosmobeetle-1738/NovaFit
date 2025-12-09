import React, { useState } from "react";
import { View, StyleSheet, Pressable, Alert, Platform, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { useQueryClient } from "@tanstack/react-query";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function BackupScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const url = new URL("/api/backup/export", getApiUrl());
      const response = await apiRequest("GET", url.toString());
      const data = await response.json();
      
      if (!data.success || !data.backup) {
        throw new Error("Failed to export data");
      }

      const backupJson = JSON.stringify(data.backup, null, 2);
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `novafit-backup-${timestamp}.json`;

      if (Platform.OS === "web") {
        const blob = new Blob([backupJson], { type: "application/json" });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
        setLastExport(new Date().toLocaleString());
        Alert.alert("Success", "Your backup has been downloaded.");
      } else {
        const fileUri = FileSystem.cacheDirectory + filename;
        await FileSystem.writeAsStringAsync(fileUri, backupJson);
        
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, {
            mimeType: "application/json",
            dialogTitle: "Save your backup",
          });
          setLastExport(new Date().toLocaleString());
        } else {
          Alert.alert("Backup Created", `Backup saved to: ${fileUri}`);
        }
      }
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Export Failed", "Could not export your data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const file = result.assets[0];
      
      Alert.alert(
        "Import Backup",
        "This will add the backup data to your account. Your existing data will be kept. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Import",
            onPress: async () => {
              setIsImporting(true);
              try {
                let backupJson: string;
                
                if (Platform.OS === "web") {
                  const response = await fetch(file.uri);
                  backupJson = await response.text();
                } else {
                  backupJson = await FileSystem.readAsStringAsync(file.uri);
                }
                
                const backup = JSON.parse(backupJson);
                
                if (!backup.version) {
                  throw new Error("Invalid backup file format");
                }

                const url = new URL("/api/backup/import", getApiUrl());
                const response = await apiRequest("POST", url.toString(), {
                  backup,
                  options: { mergeMode: "merge" },
                });
                
                const data = await response.json();
                
                if (!data.success) {
                  throw new Error(data.error || "Import failed");
                }

                queryClient.invalidateQueries();

                const counts = data.imported;
                Alert.alert(
                  "Import Successful",
                  `Imported:\n- ${counts.workouts} workouts\n- ${counts.workoutLogs} workout logs\n- ${counts.foods} foods\n- ${counts.foodEntries} food entries\n- ${counts.weightEntries} weight entries\n- ${counts.meals} meals`
                );
              } catch (error: any) {
                console.error("Import error:", error);
                Alert.alert(
                  "Import Failed",
                  error.message || "Could not import the backup file. Please check the file format."
                );
              } finally {
                setIsImporting(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Document picker error:", error);
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <Card style={styles.section}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primary + "20" }]}>
            <Feather name="download-cloud" size={32} color={theme.primary} />
          </View>
        </View>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Export Backup
        </ThemedText>
        <ThemedText type="body" style={[styles.description, { color: theme.textSecondary }]}>
          Download all your fitness data including workouts, nutrition logs, weight entries, and goals as a backup file.
        </ThemedText>
        <Pressable
          onPress={handleExport}
          disabled={isExporting}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.primary, opacity: pressed || isExporting ? 0.7 : 1 },
          ]}
        >
          <View style={styles.buttonContent}>
            {isExporting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Feather name="download" size={18} color="#FFF" style={styles.buttonIcon} />
            )}
            <ThemedText type="body" style={{ color: "#FFF", fontWeight: "600" }}>
              {isExporting ? "Exporting..." : "Export Data"}
            </ThemedText>
          </View>
        </Pressable>
        {lastExport ? (
          <ThemedText type="small" style={[styles.lastExport, { color: theme.textSecondary }]}>
            Last export: {lastExport}
          </ThemedText>
        ) : null}
      </Card>

      <Card style={styles.section}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, { backgroundColor: theme.success + "20" }]}>
            <Feather name="upload-cloud" size={32} color={theme.success} />
          </View>
        </View>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Import Backup
        </ThemedText>
        <ThemedText type="body" style={[styles.description, { color: theme.textSecondary }]}>
          Restore your data from a previously exported backup file. Your current data will be preserved and merged with the imported data.
        </ThemedText>
        <Pressable
          onPress={handleImport}
          disabled={isImporting}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.backgroundSecondary, opacity: pressed || isImporting ? 0.7 : 1 },
          ]}
        >
          <View style={styles.buttonContent}>
            {isImporting ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Feather name="upload" size={18} color={theme.primary} style={styles.buttonIcon} />
            )}
            <ThemedText type="body" style={{ color: theme.primary, fontWeight: "600" }}>
              {isImporting ? "Importing..." : "Select Backup File"}
            </ThemedText>
          </View>
        </Pressable>
      </Card>

      <Card style={styles.infoSection}>
        <Feather name="info" size={20} color={theme.textSecondary} />
        <View style={styles.infoContent}>
          <ThemedText type="h4" style={{ marginBottom: Spacing.xs }}>
            About Backups
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Backups include all your personal fitness data. Keep your backup files in a safe place. You can use them to restore your data on any device.
          </ThemedText>
        </View>
      </Card>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.lg,
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  description: {
    textAlign: "center",
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  button: {
    minWidth: 200,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  buttonIcon: {
    marginRight: Spacing.xs,
  },
  lastExport: {
    marginTop: Spacing.md,
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
});
