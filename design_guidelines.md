# FitTrack - Design Guidelines

## Architecture

### Authentication & Profile
- **No authentication required** - Single-user local app
- **Profile settings:** Customizable avatar (4 presets: runner, weightlifter, cyclist, yoga - organic illustration style with soft gradients), display name, units (metric/imperial), rest timer defaults, notifications, theme toggle, weekly goals

### Navigation
**Tab Bar (4 tabs):**
1. Home - Dashboard/progress
2. Workouts - Library/schedule
3. Nutrition - Food logging
4. Profile - Settings/goals

**Floating Action Button (FAB):**
- Bottom-right, above tab bar
- Expands upward with gentle animation: Log Workout (dumbbell), Add Food (utensils), Quick Weight (scale)

## Key Screens

### Dashboard (Home)
- **Header:** Transparent, "Good morning, [Name]", date, calendar icon (right)
- **Content:** Scrollable - Today's summary card with soft radial progress, weekly chart with rounded bars, goal widgets with gentle progress rings, recent activity timeline
- **Insets:** top: headerHeight + 32px, bottom: tabBarHeight + 32px

### Workout Library/Schedule
- **Header:** Default, "Workouts", plus icon (right), segmented control below header (Library|Schedule)
- **Content:** Library: scrollable cards with exercise previews | Schedule: 7-day horizontal scroll grid with drag-drop
- **Insets:** top: 32px, bottom: tabBarHeight + 32px

### Active Workout (Full-Screen Modal)
- **Header:** Workout name centered, pause icon (left), finish button (right), elapsed timer below
- **Content:** Scrollable exercise list with expandable sets, rest timer overlay (modal-in-modal), weight inputs, notes field
- **Insets:** top/bottom: safeArea + 32px

### Daily Food Log (Nutrition)
- **Header:** Transparent, swipeable date selector, search icon (right)
- **Content:** Scrollable - Daily calorie/macro summary with soft horizontal progress bars, meal sections (Breakfast/Lunch/Dinner/Snacks) as expandable accordions, swipe-left-to-delete
- **Insets:** top: headerHeight + 32px, bottom: tabBarHeight + FAB clearance + 48px

### Scan Nutrition Label (Camera Modal)
- **Header:** Semi-transparent overlay, "Cancel" text (left), flash toggle (right)
- **Content:** Live camera view, centered viewfinder frame with soft corners, capture button (bottom center), gallery icon (bottom left)
- **Insets:** top/bottom: safeArea + 32px

### Add Food Manually (Modal)
- **Header:** Default, "Cancel" (left), "Save" (right), "Add Food" title
- **Content:** Scrollable form - text inputs (name, serving size), numeric inputs (calories, protein, carbs, fats, fiber), "Save to My Foods" checkbox, submit/cancel buttons below form
- **Insets:** top/bottom: 32px

### Profile & Settings
- **Header:** Transparent
- **Content:** Scrollable - Avatar/name editor at top (tappable), grouped setting lists (Goals, Preferences, Data Management, About)
- **Insets:** top: headerHeight + 32px, bottom: tabBarHeight + 32px

## Design System

### Colors (Calm Wellness Theme)
**Primary:** Soft Sage `#8FAD88` | Pressed: `#7A9A74` | Light: `#A8C4A3`  
**Secondary Accent:** Warm Terracotta `#D4907B` | Pressed: `#C17D68` | Light: `#E0AA98`  
**Functional:** Success `#7FAF7A`, Warning `#E8C57C`, Error `#D4817B`, Info `#87B5C4`  
**Neutral (Light Mode):** Background `#FAF8F5` (warm off-white), Surface `#FFFFFF`, Text Primary `#3A3A3A`, Text Secondary `#7A7A7A`, Border `#E6E3DD`  
**Neutral (Dark Mode):** Background `#2A2825`, Surface `#3A3835`, Text Primary `#F5F3F0`, Text Secondary `#B8B5B0`, Border `#4A4845`  
**Macro Colors:** Protein `#D4817B`, Carbs `#E8C57C`, Fats `#A89FC9`  
**Gradient Overlays:** Primary `#8FAD88 → #A8C4A3`, Warm `#D4907B → #E8C57C`

### Typography
**Font:** System default (SF Pro Display/Roboto)  
**Scale:** H1: 34px Semibold | H2: 24px Semibold | H3: 20px Medium | Body: 17px Regular (1.6 line-height) | Caption: 15px Regular | Small: 13px Medium

### Spacing & Layout
**Scale:** xs: 4px | s: 8px | m: 16px | l: 24px | xl: 32px | xxl: 48px  
**Grid:** 16px margins, 16px gutters  
**Safe Areas:** Header: 88px typical | Tab Bar: 49px + safeArea.bottom

### Components

**Cards:**
- Background: Surface color
- Border radius: 24px (softer curves)
- Padding: 24px
- Border: 1px Border color (subtle)
- Shadow (light mode): offset {0, 2}, opacity 0.05, radius 12
- Shadow (dark mode): none
- Press feedback: Scale 0.98, gentle haptic

**FAB:**
- Size: 60px diameter
- Background: Primary gradient
- Icon: Background color, 26px
- Position: 16px from edges, 16px above tab bar
- Shadow: offset {0, 2}, opacity 0.10, radius 8
- Press: Scale 0.94

**Buttons:**
- Primary: Primary gradient bg, Background text, 52px height, 16px radius, medium font
- Secondary: 2px Primary border, Primary text, 52px height, 16px radius, medium font
- Tertiary: Surface bg, Text Primary, 52px height, 16px radius
- Text-only: No bg, Primary text, 44px min touch
- Press: Scale 0.97, opacity 0.80

**Input Fields:**
- Height: 52px
- Background: Surface
- Border: 1px Border color
- Border radius: 16px
- Focus: 2px Primary border
- Padding: 16px horizontal
- Label: Caption size, Text Secondary, 8px above field

**Progress Elements:**
- Bars: 10px height, 8px radius, Border bg, soft gradient fill
- Rings: 6px stroke width, Primary gradient, smooth animation
- Percentage text: Medium weight, Primary color

**List Items:**
- Min height: 72px
- Horizontal padding: 20px
- Separator: 1px Border (20px left inset)
- Press: Subtle Surface background shift
- Swipe actions: Delete (Error bg with reduced opacity, white icon)

**Charts:**
- Bar charts: 10px width, 6px radius, soft gradient fill
- Line charts: 2.5px stroke, Primary gradient below line
- Grid: 1px Border, very low opacity
- Smooth entry: 900ms ease-out

### Interactions & Animations

**Touch Feedback:**
- All touchables: Gentle scale + soft haptic
- Toggles: Smooth 300ms transition
- Checkboxes: Gentle scale animation

**Gestures:**
- Swipe left on list items: Delete action (soft red destructive bg)
- Pull-to-refresh: Gentle spinner with Primary color
- Drag-to-reorder: Subtle lift with soft shadow

**Transitions:**
- Screen push/pop: Native defaults
- Modal present: Gentle slide up 350ms ease-out
- FAB menu: Staggered 180ms per item
- Progress fills: 700ms ease-in-out
- Chart animations: 1200ms ease-in-out

### Accessibility

**Visual Requirements:**
- Minimum touch targets: 44x44px
- Text contrast: 4.5:1 for body, 3:1 for large text
- Color not sole indicator: Pair icons with text labels
- Dynamic type support
- Reduced motion: Disable animations when system setting enabled

**Screen Reader Support:**
- Descriptive labels for all icons and images
- Form inputs have associated labels
- Progress indicators announce percentage
- Button purposes clearly stated
- Logical element grouping

**Keyboard Navigation:**
- Logical tab order through forms and lists
- All interactive elements focusable
- Enter submits forms, Escape dismisses modals

## Critical Assets

**Avatars (4 presets):**
- Runner, weightlifter, cyclist, yoga
- Size: 240x240px
- Style: Organic illustrations with soft, hand-drawn quality and Primary gradient overlay
- Background: Transparent
- Format: PNG

**Empty State Illustrations:**
- No workouts, no food logged, no data
- Size: 140x140px
- Style: Gentle line art with Primary gradient, 3px stroke weight, organic curves
- Format: SVG or PNG

**Icons:**
- Library: Feather icons via @expo/vector-icons
- Primary actions: home, activity, utensils, user, plus-circle, search, calendar, camera, trash-2, edit-3, check-circle, x, pause-circle, play-circle, target, trending-up
- Size: 24px default, 28px for emphasis, 20px for inline
- Color: Dynamic based on context