import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  TextInput,
  Platform,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  FadeInUp,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/lib/auth";
import { BorderRadius, Spacing, Typography, Colors } from "@/constants/theme";

type AuthMode = "login" | "register";

export default function AuthScreen() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const tabIndicatorPosition = useSharedValue(0);

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    setError("");
    tabIndicatorPosition.value = withSpring(newMode === "login" ? 0 : 1, {
      damping: 15,
      stiffness: 150,
    });
  };

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabIndicatorPosition.value * 120 }],
  }));

  const handleSubmit = async () => {
    setError("");
    
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }
    if (mode === "register" && !name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    
    try {
      const result = mode === "login"
        ? await login(email.trim().toLowerCase(), password)
        : await register(email.trim().toLowerCase(), password, name.trim());

      if (!result.success) {
        setError(result.error || "Something went wrong");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <ThemedText type="h1" style={styles.appName}>NovaFit</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Track your fitness journey
          </ThemedText>
        </View>

        <Animated.View 
          entering={FadeInUp.delay(200).springify()}
          style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}
        >
          <View style={styles.tabContainer}>
            <Animated.View
              style={[
                styles.tabIndicator,
                { backgroundColor: theme.primary },
                indicatorStyle,
              ]}
            />
            <Pressable
              style={styles.tab}
              onPress={() => handleModeChange("login")}
            >
              <ThemedText
                type="body"
                style={[
                  styles.tabText,
                  mode === "login" && { color: theme.buttonText, fontWeight: "600" },
                ]}
              >
                Sign In
              </ThemedText>
            </Pressable>
            <Pressable
              style={styles.tab}
              onPress={() => handleModeChange("register")}
            >
              <ThemedText
                type="body"
                style={[
                  styles.tabText,
                  mode === "register" && { color: theme.buttonText, fontWeight: "600" },
                ]}
              >
                Sign Up
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.form}>
            {mode === "register" ? (
              <View style={styles.inputContainer}>
                <Feather
                  name="user"
                  size={20}
                  color={theme.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.backgroundTertiary,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                  placeholder="Your name"
                  placeholderTextColor={theme.textSecondary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <Feather
                name="mail"
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundTertiary,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Email address"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Feather
                name="lock"
                size={20}
                color={theme.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundTertiary,
                    color: theme.text,
                    borderColor: theme.border,
                    paddingRight: 48,
                  },
                ]}
                placeholder="Password"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={theme.textSecondary}
                />
              </Pressable>
            </View>

            {error ? (
              <Animated.View
                entering={FadeInUp.springify()}
                style={[styles.errorContainer, { backgroundColor: theme.error + "20" }]}
              >
                <Feather name="alert-circle" size={16} color={theme.error} />
                <ThemedText type="small" style={{ color: theme.error, marginLeft: Spacing.sm }}>
                  {error}
                </ThemedText>
              </Animated.View>
            ) : null}

            <Button
              onPress={handleSubmit}
              disabled={isLoading}
              style={styles.submitButton}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.buttonText} size="small" />
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
          </ThemedText>
          <Pressable onPress={() => handleModeChange(mode === "login" ? "register" : "login")}>
            <ThemedText type="small" style={{ color: theme.primary, fontWeight: "600" }}>
              {mode === "login" ? "Sign Up" : "Sign In"}
            </ThemedText>
          </Pressable>
        </View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.lg,
  },
  appName: {
    marginBottom: Spacing.xs,
  },
  card: {
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.xl,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: Spacing.xl,
    position: "relative",
  },
  tabIndicator: {
    position: "absolute",
    width: 120,
    height: "100%",
    borderRadius: BorderRadius.lg,
  },
  tab: {
    width: 120,
    paddingVertical: Spacing.md,
    alignItems: "center",
    zIndex: 1,
  },
  tabText: {
    fontWeight: "500",
  },
  form: {
    gap: Spacing.lg,
  },
  inputContainer: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: Spacing.lg,
    top: 14,
    zIndex: 1,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingLeft: 48,
    ...Typography.body,
    borderWidth: 1,
  },
  passwordToggle: {
    position: "absolute",
    right: Spacing.lg,
    top: 14,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
});
