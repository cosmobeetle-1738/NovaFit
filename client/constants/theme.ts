import { Platform } from "react-native";

// Celestial Theme - Deep space with cosmic accents
const primaryColor = "#7B68EE"; // Medium slate blue (starlight)
const primaryDark = "#5D4DB3";
const primaryLight = "#9D8FFF";
const accentColor = "#F0A8D0"; // Soft nebula pink

export const Colors = {
  light: {
    text: "#2D2D3A",
    textSecondary: "#5A5A6E",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9E9EAE",
    tabIconSelected: primaryColor,
    link: primaryColor,
    primary: primaryColor,
    primaryDark: primaryDark,
    primaryLight: primaryLight,
    accent: accentColor,
    backgroundRoot: "#F8F8FC",
    backgroundDefault: "#F0F0F8",
    backgroundSecondary: "#E8E8F2",
    backgroundTertiary: "#E0E0EC",
    border: "#D8D8E6",
    success: "#6BBF8A",
    warning: "#F4C56A",
    error: "#E07A7A",
    info: "#6BAADD",
    protein: "#6BBF8A",
    carbs: "#F4A5B8",
    fats: "#6BAADD",
    calories: primaryColor,
    // Workout category colors - celestial palette
    workoutStrength: "#E07A5F",
    workoutCardio: "#6BAADD",
    workoutCore: "#F4C56A",
    workoutFlexibility: "#9B7BB8",
    workoutCustom: "#5B9A7A",
  },
  dark: {
    text: "#E8E8F0",
    textSecondary: "#A0A0B8",
    buttonText: "#FFFFFF",
    tabIconDefault: "#6B6B80",
    tabIconSelected: primaryLight,
    link: primaryLight,
    primary: primaryColor,
    primaryDark: primaryDark,
    primaryLight: primaryLight,
    accent: accentColor,
    backgroundRoot: "#0D0D14",
    backgroundDefault: "#14141E",
    backgroundSecondary: "#1E1E2A",
    backgroundTertiary: "#282836",
    border: "#363648",
    success: "#6BBF8A",
    warning: "#F4C56A",
    error: "#E07A7A",
    info: "#6BAADD",
    protein: "#6BBF8A",
    carbs: "#F4A5B8",
    fats: "#6BAADD",
    calories: primaryLight,
    // Workout category colors - celestial palette
    workoutStrength: "#E07A5F",
    workoutCardio: "#6BAADD",
    workoutCore: "#F4C56A",
    workoutFlexibility: "#9B7BB8",
    workoutCustom: "#5B9A7A",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 56,
  inputHeight: 48,
  buttonHeight: 48,
  fabSize: 60,
  listItemHeight: 64,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "600" as const,
    letterSpacing: -0.4,
  },
  h2: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 18,
    fontWeight: "500" as const,
  },
  body: {
    fontSize: 17,
    fontWeight: "400" as const,
    lineHeight: 24,
  },
  small: {
    fontSize: 15,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 13,
    fontWeight: "500" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  link: {
    fontSize: 17,
    fontWeight: "400" as const,
  },
};

export const Shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  fab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
