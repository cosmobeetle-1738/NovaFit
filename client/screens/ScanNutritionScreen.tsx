import React, { useState, useRef } from "react";
import { View, StyleSheet, Pressable, Platform, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useStore } from "@/lib/store";
import { apiRequest } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { NutritionStackParamList } from "@/navigation/NutritionStackNavigator";

type Navigation = NativeStackNavigationProp<NutritionStackParamList>;

export default function ScanNutritionScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navigation>();
  const { theme } = useTheme();
  const store = useStore();

  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    name: string;
    servingSize: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  } | null>(null);

  const cameraRef = useRef<CameraView>(null);

  const handleCapture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
      });
      if (photo) {
        setCapturedImage(photo.uri);
        analyzeImage(photo.uri);
      }
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const analyzeImage = async (imageUri: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setExtractedData(null);
    
    try {
      // Read the image as base64 - use string literal for compatibility
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
      });
      
      const imageBase64 = `data:image/jpeg;base64,${base64}`;
      
      // Send to our API for OpenAI vision analysis
      const response = await apiRequest("POST", "/api/analyze-nutrition", {
        imageBase64,
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setExtractedData({
          name: result.data.name,
          servingSize: result.data.servingSize,
          calories: result.data.calories,
          protein: result.data.protein,
          carbs: result.data.carbs,
          fats: result.data.fats,
          fiber: result.data.fiber,
        });
      } else {
        setAnalysisError(result.error || "Could not analyze the nutrition label");
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      setAnalysisError("Failed to analyze the image. Please try again.");
    }
    
    setIsAnalyzing(false);
  };

  const handleSave = () => {
    if (!extractedData) return;

    store.addFood({
      ...extractedData,
      isSaved: true,
    });

    navigation.goBack();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setExtractedData(null);
  };

  if (Platform.OS === "web") {
    return (
      <ThemedView
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.webFallback}>
          <Feather name="camera-off" size={48} color={theme.textSecondary} />
          <ThemedText
            type="h4"
            style={{ marginTop: Spacing.lg, textAlign: "center" }}
          >
            Camera not available on web
          </ThemedText>
          <ThemedText
            type="body"
            style={{
              color: theme.textSecondary,
              marginTop: Spacing.sm,
              textAlign: "center",
            }}
          >
            Run this app in Expo Go on your phone to scan nutrition labels
          </ThemedText>
          <Button onPress={() => navigation.goBack()} style={{ marginTop: Spacing.xl }}>
            Go Back
          </Button>
        </View>
      </ThemedView>
    );
  }

  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centered}>
          <ThemedText>Loading camera...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.centered}>
          <Feather name="camera" size={48} color={theme.textSecondary} />
          <ThemedText
            type="h4"
            style={{ marginTop: Spacing.lg, textAlign: "center" }}
          >
            Camera Permission Required
          </ThemedText>
          <ThemedText
            type="body"
            style={{
              color: theme.textSecondary,
              marginTop: Spacing.sm,
              textAlign: "center",
              paddingHorizontal: Spacing.xl,
            }}
          >
            We need camera access to scan nutrition labels from food products
          </ThemedText>
          <Button onPress={requestPermission} style={{ marginTop: Spacing.xl }}>
            Enable Camera
          </Button>
          <Pressable
            onPress={() => navigation.goBack()}
            style={{ marginTop: Spacing.lg }}
          >
            <ThemedText type="body" style={{ color: theme.primary }}>
              Cancel
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  if (capturedImage) {
    return (
      <KeyboardAwareScrollViewCompat
        style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
      >
        <View style={styles.header}>
          <Pressable onPress={handleRetake} style={styles.headerButton}>
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>
          <ThemedText type="h4">Scanned Label</ThemedText>
          <View style={{ width: 44 }} />
        </View>

        <Image source={{ uri: capturedImage }} style={styles.previewImage} />

        {isAnalyzing ? (
          <View style={styles.analyzing}>
            <Feather name="loader" size={32} color={theme.primary} />
            <ThemedText type="body" style={{ marginTop: Spacing.md }}>
              Analyzing nutrition label...
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
              This may take a few seconds
            </ThemedText>
          </View>
        ) : analysisError ? (
          <Card style={styles.resultCard}>
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={32} color={theme.error} />
              <ThemedText type="body" style={{ color: theme.error, marginTop: Spacing.md, textAlign: "center" }}>
                {analysisError}
              </ThemedText>
              <Button onPress={handleRetake} style={{ marginTop: Spacing.lg }}>
                Try Again
              </Button>
            </View>
          </Card>
        ) : extractedData ? (
          <Card style={styles.resultCard}>
            <ThemedText type="h4" style={styles.resultTitle}>
              Extracted Nutrition
            </ThemedText>
            <View style={styles.resultRow}>
              <ThemedText type="body">Name</ThemedText>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {extractedData.name}
              </ThemedText>
            </View>
            <View style={styles.resultRow}>
              <ThemedText type="body">Serving Size</ThemedText>
              <ThemedText type="body">{extractedData.servingSize}</ThemedText>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.resultRow}>
              <ThemedText type="body" style={{ color: theme.primary }}>
                Calories
              </ThemedText>
              <ThemedText
                type="h4"
                style={{ color: theme.primary }}
              >
                {extractedData.calories}
              </ThemedText>
            </View>
            <View style={styles.macroRow}>
              <View style={styles.macroItem}>
                <ThemedText type="small" style={{ color: theme.protein }}>
                  Protein
                </ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {extractedData.protein}g
                </ThemedText>
              </View>
              <View style={styles.macroItem}>
                <ThemedText type="small" style={{ color: theme.carbs }}>
                  Carbs
                </ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {extractedData.carbs}g
                </ThemedText>
              </View>
              <View style={styles.macroItem}>
                <ThemedText type="small" style={{ color: theme.fats }}>
                  Fats
                </ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {extractedData.fats}g
                </ThemedText>
              </View>
              <View style={styles.macroItem}>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Fiber
                </ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {extractedData.fiber}g
                </ThemedText>
              </View>
            </View>
            <Button onPress={handleSave}>Save to My Foods</Button>
          </Card>
        ) : null}
      </KeyboardAwareScrollViewCompat>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={[styles.overlay, { paddingTop: insets.top }]}>
          <View style={styles.topBar}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.closeButton}
            >
              <ThemedText type="body" style={{ color: "#FFF" }}>
                Cancel
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          <ThemedText type="body" style={styles.instruction}>
            Position the nutrition label within the frame
          </ThemedText>

          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + Spacing.lg }]}>
            <Pressable onPress={handlePickImage} style={styles.galleryButton}>
              <Feather name="image" size={24} color="#FFF" />
            </Pressable>
            <Pressable onPress={handleCapture} style={styles.captureButton}>
              <View style={styles.captureInner} />
            </Pressable>
            <View style={{ width: 44 }} />
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  webFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-start",
    padding: Spacing.lg,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  viewfinder: {
    flex: 1,
    marginHorizontal: Spacing["2xl"],
    marginVertical: Spacing["4xl"],
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#FFF",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  instruction: {
    color: "#FFF",
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  galleryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FFF",
    borderWidth: 3,
    borderColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  analyzing: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  resultCard: {
    marginBottom: Spacing.lg,
  },
  resultTitle: {
    marginBottom: Spacing.lg,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: Spacing.lg,
  },
  macroItem: {
    alignItems: "center",
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
});
