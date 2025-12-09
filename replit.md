# FitTrack - Fitness Tracker Application

## Overview

FitTrack is a comprehensive fitness tracking mobile application built with React Native and Expo. It provides users with tools to log workouts, track nutrition, monitor progress, and manage fitness goals. The app is designed as a single-user, local-first application with no authentication required, focusing on simplicity and ease of use.

Key features include:
- Workout planning and tracking with customizable exercises
- Nutrition logging with food database and meal creation
- Progress tracking with calendar views and exercise analytics
- Profile management with customizable goals
- Real-time workout timer and rest period tracking
- Camera-based nutrition label scanning (planned feature)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Platform:**
- React Native (v0.81.5) with Expo (v54)
- TypeScript for type safety
- Navigation using React Navigation v7 with native stack and bottom tabs
- New Architecture enabled for improved performance

**UI/UX Design:**
- Custom theming system with light/dark mode support
- Glass morphism effects using expo-blur and expo-glass-effect
- Reanimated v4 for smooth animations and gestures
- Safe area and keyboard-aware layouts
- Bottom tab navigation with 5 main sections (Home, Workouts, Nutrition, Calendar, Profile)
- Floating Action Button (FAB) for quick actions
- Platform-specific adaptations for iOS, Android, and Web

**State Management:**
- Local in-memory state using React hooks and custom store (`client/lib/store.ts`)
- TanStack Query (React Query) v5 for server state management and caching
- No authentication - single-user local app design

**Component Architecture:**
- Themed components (ThemedView, ThemedText) for consistent styling
- Reusable UI components (Button, Card, ProgressBar, etc.)
- Gesture-based interactions using react-native-gesture-handler
- Swipe-to-delete functionality for food entries
- Animated components using Reanimated for performance

### Backend Architecture

**Server Framework:**
- Express.js for HTTP server
- TypeScript with tsx for development
- esbuild for production bundling
- Modular route registration system

**Development vs Production:**
- Development: Runs Expo dev server alongside Express backend
- Production: Serves static Expo bundle with Express
- CORS configuration for Replit domain handling
- Proxy middleware for development environment

**Data Storage:**
- In-memory storage implementation (`MemStorage` class)
- Abstracted storage interface (`IStorage`) for future database integration
- Currently no persistent database - designed for later PostgreSQL integration

### External Dependencies

**Mobile Platform Services:**
- Expo Camera - For nutrition label scanning
- Expo Image Picker - For selecting images from gallery
- Expo Haptics - For tactile feedback
- Expo Splash Screen - For app launch experience
- Expo Web Browser - For in-app browser functionality

**Database (Planned):**
- Drizzle ORM v0.39 configured for PostgreSQL
- Schema defined in `shared/schema.ts`
- Migration support configured via drizzle-kit
- Currently using in-memory storage with plans for PostgreSQL

**AI/ML Services (Planned):**
- OpenAI API v6.10 - For nutrition label text extraction and analysis
- Camera integration for scanning food labels

**UI Libraries:**
- Expo Vector Icons (Feather icon set)
- React Native Reanimated v4 - High-performance animations
- React Native Gesture Handler v2.28 - Touch gesture system
- React Native Keyboard Controller v1.18 - Keyboard management
- React Native Screens v4.16 - Native screen primitives

**Development Tools:**
- Babel with module resolver for path aliases (@/ and @shared/)
- ESLint with Expo and Prettier configurations
- TypeScript for type checking
- Drizzle Kit for schema migrations

**Path Aliases:**
- `@/` → `./client/`
- `@shared/` → `./shared/`

**Platform Targets:**
- iOS (tablet support enabled)
- Android (edge-to-edge, adaptive icons)
- Web (single page output)

**Design System:**
- Custom theme constants in `client/constants/theme.ts`
- Color schemes for light/dark modes
- Typography, spacing, and border radius scales
- Platform-specific styling adaptations