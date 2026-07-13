# 🗺️ PLAN & LEARN (Cognimosity-Plan)

[![Expo SDK 57](https://img.shields.io/badge/Expo-SDK%2057-00020d?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-v0.86-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![NativeWind v4](https://img.shields.io/badge/Styling-NativeWind_v4-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://www.nativewind.dev/)
[![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=for-the-badge)](https://github.com/pmndrs/zustand)
[![MMKV](https://img.shields.io/badge/Storage-MMKV_Fast-green?style=for-the-badge)](https://github.com/mrousavy/react-native-mmkv)

An advanced, AI-powered educational roadmap and curriculum planning application built with **React Native** and **Expo (SDK 57)**. Engineered around a striking, tactile **neobrutalist design system**, PLAN & LEARN delivers real-time learning path generation, interactive visualizations, and adaptive curriculum tuning.

---

## 🎯 Intent & Motivation

**Plan & Learn** was born out of frustration with the modern habit of endlessly scrolling through social media and short-form content. Realizing that many others share this struggle, the idea emerged: what if we could redirect that urge into a learning app that is visually pleasing, accessible, and highly structured?

Our motivation is to make learning new things as frictionless as possible. Not everyone wants to learn prompt engineering or wrestle with the nitty-gritty of AI just to study a new topic. Plan & Learn abstracts all of that away—serving as a personalized AI tutor that instantly breaks down any subject into an intuitive, sequential roadmap. Whether you want bite-sized insights or a highly detailed course, the app tailors the content to your chosen depth, making structured learning a delightful alternative to mindless scrolling.

---

## ✨ Comprehensive Features

*   **🧠 Intelligent Two-Phase Generation & Streaming**
    *   **Phase 1 (Structure)**: Instantly generates a customized, node-based curriculum map from any learning topic.
    *   **Phase 2 (Lazy Content)**: Generates highly comprehensive module content—including reading material, LaTeX math, diagrams, and citations—on-demand as you dive into each step.
    *   **Live Stream Parsing**: In-flight partial JSON repair algorithms automatically rebuild chunked streams to display nodes and text incrementally.
*   **🗺️ Interactive Graph & Diagram Rendering**
    *   **Curriculum Maps**: A bespoke visual canvas that renders the AI-generated curriculum as an interactive node graph, allowing users to intuitively navigate their learning journey and track progression.
    *   **Material Flowcharts**: Dynamic Mermaid.js graph rendering embedded directly within course material to visualize complex workflows and system flows with interactive zoom and pan support.
*   **🎓 Audience-Aware Personalization**
    *   Features a 3-step tactile onboarding workflow that adjusts complexity, tone, and practical application parameters dynamically across three levels:
        *   *School Student*: Simplified analogies, basic conceptual overviews, and low jargon.
        *   *University Student*: Technical depth, coding examples, and mathematical foundations.
        *   *Working Professional*: Architectural scaling, production-grade patterns, and systems engineering.
*   **📚 Textbook-Grade STEM Rendering**
    *   **KaTeX Math Expressions**: Embedded display-mode mathematical expressions rendering dynamically via custom sandboxed WebViews.
*   **🔗 Source & Citation Tracking**
    *   In-app sources modal to track AI-generated references, allowing users to verify information and read external literature directly.
*   **⚡ High-Performance Offline-First Architecture**
    *   **MMKV Synced Storage**: Ultra-fast key-value store powered by `react-native-mmkv` with zero-flash synchronous theme initialization.
    *   **Fail-Safe Node Migrations**: Automated state schema migrations that shield active roadmaps from breaking changes during app upgrades.
    *   **Precision Viewport Tracking**: Continuously monitors scroll depth to calculate, persist, and display reading progress rings around nodes.
*   **🎨 Neobrutalist Aesthetic & Accessibility**
    *   Bold high-contrast borders, solid offsets, true-black pure dark mode, tactile haptic feedback (using `expo-haptics`), and modern typography via **Space Grotesk**.
    *   Font-zoom and dynamic text sizing for accessible reading.
    *   Delightful custom animations, including a **Confetti Cannon** on course completion and a **Standing Wave Loader**.

---

## 🛠️ Technical Details

*   **Framework**: Expo SDK 57 (React Native 0.74+) utilizing the new architecture when possible, with `expo-router` for file-based deep linking and navigation.
*   **Styling**: `NativeWind` v4 (Tailwind CSS for React Native), deeply customized for a Neobrutalist design system incorporating dynamic light/dark modes and raw CSS shadow offsets.
*   **State Management**: `zustand` combined with `react-native-mmkv` for high-speed, synchronous offline persistence of user settings and massive roadmap JSON objects.
*   **AI & Data Streaming**: Real-time generative AI pipeline utilizing HTTP streaming. Custom parsing utilities reconstruct malformed/incomplete JSON chunks on the fly to render UI before the request completes.
*   **WebViews & Advanced Rendering**: Uses `react-native-webview` to securely sandbox and execute DOM-heavy libraries like KaTeX for mathematics and Mermaid.js for node-graph rendering, communicating with the React Native thread via injected JavaScript bridges.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [Android Studio](https://developer.android.com/studio) (for Android emulation & build tools)
*   [Xcode](https://developer.apple.com/xcode/) (macOS only, for iOS simulation)

### Installation

1. Clone the repository to your local machine:
   ```bash
   git clone <repository-url>
   cd Planner
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

### Running the App Locally

To launch the Metro bundler:
```bash
npm run start
```

Use the console shortcuts to open the app on your environment:
*   Press **`a`** to open on an Android emulator or connected device.
*   Press **`i`** to open on the iOS simulator (macOS only).
*   Press **`r`** to force reload the Metro bundler.
*   Use `npx expo start --clear` to clear the bundler cache if you encounter resolution issues.

---

## 📦 Production Builds (Android APK)

PLAN & LEARN utilizes **Continuous Native Generation (CNG)**. Do not manually commit native `/android` or `/ios` files unless specifically necessary; configure them via `app.json` plugins.

### 1. Prebuilding Native Directories
Ensure native dependencies are correctly configured and clean directories are generated:
```bash
npx expo prebuild --platform android --clean
```

### 2. Native Compilation
To build a local debug APK:
```bash
cd android
./gradlew assembleDebug
```
*(On Windows, use `.\gradlew.bat assembleDebug`)*

The generated APK will be available at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📂 Architecture & Directory Structure

```
├── app/                  # File-based routing (Expo Router SDK 57)
│   ├── (drawer)/         # Main navigation layouts (Learning Paths, Settings)
│   ├── roadmap/          # Roadmap progress flow & interactive node canvas
│   ├── material/         # Detailed course screens, font zoom menus, & reading engine
│   ├── onboarding.tsx    # Neobrutalist 3-step profile customizer
│   └── _layout.tsx       # Global themes, navigation provider, & safe area offsets
├── assets/               # Brand elements, launcher icons, and splash screens
├── src/                  # Core source code
│   ├── components/       # Reusable UI controls (KaTeX webviews, Mermaid canvas, loaders, Modals)
│   ├── store/            # Zustand state stores (MMKV storage engine & node schema migrations)
│   ├── hooks/            # Custom hooks (Stream managers, keyboard animations, UI logic)
│   ├── services/         # API clients & network endpoints
│   └── declarations.d.ts # Module declarations (e.g., resolving untyped dependencies or custom asset imports)
├── tailwind.config.js    # Utility styles, spacing tokens, and border variables
├── app.json              # Central Expo config, permissions, & build plugins
└── tsconfig.json         # TypeScript compiler configurations
```

---

## 🔧 Developer Guide & Troubleshooting

### Windows Native Build Support
Building native packages on Windows can occasionally fail due to file path limitations or environment issues:

1.  **Path Length Limitations (`MAX_PATH` Limit)**:
    Windows enforces a 260-character path limit. C++ builds (like `react-native-vector-icons` and JSI modules) will fail if nested deeply.
    *   **Solution**: We redirect CMake build staging to `C:/tmp/pl-cxx` inside `android/app/build.gradle`. Make sure your build terminal has write permissions for `C:/`.

2.  **SDK Path Resolution (`local.properties`)**:
    If your `ANDROID_HOME` variable is not globally configured, specify it explicitly inside `android/local.properties`:
    ```properties
    sdk.dir=C:/Users/<YourUsername>/AppData/Local/Android/Sdk
    ```

3.  **Metro Bundler Clearing**:
    For styling or SVG updates that aren't showing up:
    ```bash
    npx expo start -c
    ```

---

## 🤝 Contribution Guidelines

*   **TypeScript Integrity**: Ensure all component props and store state are strictly typed. Validate before committing:
    ```bash
    npx tsc --noEmit
    ```
*   **Aesthetics Priority**: Maintain neobrutalist styling norms. Use thick borders (`border-3` or `border-4`), heavy offset shadow transformations, and Space Grotesk typography.
*   **Expo Standards**: Refer directly to [Expo v57 Documentation](https://docs.expo.dev/versions/v57.0.0/) for native plugin structures and router hooks.
