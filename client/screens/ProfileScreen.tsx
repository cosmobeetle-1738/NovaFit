import React, { useState } from "react";
import { View, StyleSheet, Pressable, Image, TextInput, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";

type ProfileNavigation = NativeStackNavigationProp<ProfileStackParamList>;

interface SettingsRowProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
}

function SettingsRow({ icon, label, value, onPress }: SettingsRowProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsRow,
        { backgroundColor: pressed ? theme.backgroundDefault : "transparent" },
      ]}
    >
      <View style={styles.settingsRowLeft}>
        <View
          style={[styles.settingsIcon, { backgroundColor: theme.backgroundDefault }]}
        >
          <Feather name={icon} size={18} color={theme.primary} />
        </View>
        <ThemedText type="body">{label}</ThemedText>
      </View>
      <View style={styles.settingsRowRight}>
        {value ? (
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {value}
          </ThemedText>
        ) : null}
        <Feather name="chevron-right" size={18} color={theme.textSecondary} />
      </View>
    </Pressable>
  );
}

const avatarIcons: Record<string, keyof typeof Feather.glyphMap> = {
  mercury: "zap",
  venus: "heart",
  earth: "globe",
  mars: "target",
  jupiter: "circle",
  saturn: "disc",
  uranus: "wind",
  neptune: "droplet",
};

const planetNames: Record<string, string> = {
  mercury: "Mercury",
  venus: "Venus",
  earth: "Earth",
  mars: "Mars",
  jupiter: "Jupiter",
  saturn: "Saturn",
  uranus: "Uranus",
  neptune: "Neptune",
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<ProfileNavigation>();
  const { theme } = useTheme();
  const store = useStore();
  const { user, updateProfile } = useAuth();

  const userName = user?.name || "User";
  const userAvatar = (user?.avatar || "earth") as "mercury" | "venus" | "earth" | "mars" | "jupiter" | "saturn" | "uranus" | "neptune";
  const userUnits = (user?.units || "imperial") as "metric" | "imperial";

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);

  const avatars: Array<"mercury" | "venus" | "earth" | "mars" | "jupiter" | "saturn" | "uranus" | "neptune"> = [
    "mercury",
    "venus",
    "earth",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
  ];

  const cycleAvatar = async () => {
    const currentIndex = avatars.indexOf(userAvatar);
    const nextIndex = (currentIndex + 1) % avatars.length;
    await updateProfile({ avatar: avatars[nextIndex] });
  };

  const toggleUnits = async () => {
    const newUnits = userUnits === "metric" ? "imperial" : "metric";
    await updateProfile({ units: newUnits });
  };

  const handleEditName = () => {
    setTempName(userName);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (tempName.trim()) {
      await updateProfile({ name: tempName.trim() });
    }
    setIsEditingName(false);
  };

  const handleCancelEditName = () => {
    setTempName(userName);
    setIsEditingName(false);
  };

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
      <View style={styles.profileHeader}>
        <Pressable
          onPress={cycleAvatar}
          style={[styles.avatar, { backgroundColor: theme.primary }]}
        >
          <Feather
            name={avatarIcons[userAvatar]}
            size={56}
            color="#FFF"
          />
        </Pressable>
        <Pressable onPress={handleEditName} style={styles.nameRow}>
          <ThemedText type="h2" style={styles.name}>
            {userName}
          </ThemedText>
          <Feather name="edit-2" size={16} color={theme.textSecondary} />
        </Pressable>
        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
          {planetNames[userAvatar]}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
          Tap avatar to change planet
        </ThemedText>
      </View>

      <Modal
        visible={isEditingName}
        transparent
        animationType="fade"
        onRequestClose={handleCancelEditName}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h4" style={{ marginBottom: Spacing.lg }}>
              Edit Name
            </ThemedText>
            <TextInput
              value={tempName}
              onChangeText={setTempName}
              placeholder="Enter your name"
              placeholderTextColor={theme.textSecondary}
              autoFocus
              style={[
                styles.nameInput,
                { backgroundColor: theme.backgroundSecondary, color: theme.text },
              ]}
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={handleCancelEditName}
                style={[styles.modalButton, { backgroundColor: theme.backgroundSecondary }]}
              >
                <ThemedText type="body">Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveName}
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
              >
                <ThemedText type="body" style={{ color: "#FFF" }}>
                  Save
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Card style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Goals
        </ThemedText>
        <SettingsRow
          icon="target"
          label="Daily Calories"
          value={`${store.profile.goals.dailyCalories} cal`}
          onPress={() => navigation.navigate("Goals")}
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingsRow
          icon="activity"
          label="Weekly Workouts"
          value={`${store.profile.goals.weeklyWorkouts} days`}
          onPress={() => navigation.navigate("Goals")}
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <SettingsRow
          icon="trending-down"
          label="Target Weight"
          value={`${store.profile.goals.targetWeight} ${userUnits === "imperial" ? "lbs" : "kg"}`}
          onPress={() => navigation.navigate("Goals")}
        />
      </Card>

      <Card style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Preferences
        </ThemedText>
        <SettingsRow
          icon="globe"
          label="Units"
          value={userUnits === "imperial" ? "Imperial (lbs)" : "Metric (kg)"}
          onPress={toggleUnits}
        />
      </Card>

      <Card style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Data Management
        </ThemedText>
        <SettingsRow
          icon="save"
          label="Backup & Restore"
          value=""
          onPress={() => navigation.navigate("Backup")}
        />
      </Card>

      <Card style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Macros Goals
        </ThemedText>
        <View style={styles.macroRow}>
          <View style={styles.macroItem}>
            <View style={[styles.macroDot, { backgroundColor: theme.protein }]} />
            <ThemedText type="small">Protein</ThemedText>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {store.profile.goals.dailyProtein}g
            </ThemedText>
          </View>
          <View style={styles.macroItem}>
            <View style={[styles.macroDot, { backgroundColor: theme.carbs }]} />
            <ThemedText type="small">Carbs</ThemedText>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {store.profile.goals.dailyCarbs}g
            </ThemedText>
          </View>
          <View style={styles.macroItem}>
            <View style={[styles.macroDot, { backgroundColor: theme.fats }]} />
            <ThemedText type="small">Fats</ThemedText>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {store.profile.goals.dailyFats}g
            </ThemedText>
          </View>
        </View>
      </Card>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  name: {
    marginBottom: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  settingsRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  settingsRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  divider: {
    height: 1,
    marginLeft: 52,
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  macroItem: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  nameInput: {
    height: 48,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    marginBottom: Spacing.lg,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
});
