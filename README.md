# Cognimosity-Plan

A modern, highly performant planner and roadmap application built with **React Native** and **Expo (SDK 57)**. The application features a custom, premium design language.

## 🚀 Tech Stack

- **Core Framework**: [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/) (v57.0.0)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (v57.0.0, using file-based routing and Drawer Layout)
- **Styling**: [Tailwind CSS / NativeWind](https://www.nativewind.dev/) (v4) for responsive utility-first styles
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (lightweight, hook-based state store)
- **Local Storage**: [React Native MMKV](https://github.com/mrousavy/react-native-mmkv) (ultra-fast, synchronous key-value storage)
- **Rendering**: Markdown support via `react-native-markdown-display`

---

## 🛠️ Getting Started

### Prerequisites

Make sure you have Node.js, npm, and the Android/iOS development environments set up on your machine.

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the Expo development bundler:
```bash
npm run start
```
From here, you can run the app on an Android emulator/device by pressing `a`, or iOS simulator by pressing `i`.

---

## 📦 Building the Android APK

The Android APK is compiled using Expo Prebuild (CNG - Continuous Native Generation).

### 1. Generating App Icons
We generate the required native assets from our base logo file (`assets/new_icon.png`):
- `assets/icon.png` (Main app icon - 1024x1024)
- `assets/android-icon-foreground.png` (Adaptive foreground centered at 66% - 512x512)
- `assets/android-icon-background.png` (Solid white background - 512x512)
- `assets/android-icon-monochrome.png` (Themed adaptive monochrome icon - 512x512)
- `assets/favicon.png` (Favicon - 48x48)

### 2. Prebuilding the Native Directories
Regenerate/clean the `/android` directory using Expo configurations in `app.json`:
```bash
npx expo prebuild --platform android --clean
```

### 3. Compiling the APK
To build the debug APK:
```bash
cd android
.\gradlew.bat assembleDebug
```
The output APK is generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🤝 Contributing & Testing Environment

We welcome contributions! To set up your testing and development environment:

### 1. Prerequisites & Environment Setup
- **Node.js**: Ensure you have Node.js (v18+) installed.
- **Android SDK**: Install [Android Studio](https://developer.android.com/studio) and configure the Android SDK.
- **Environment Variables**: Set `ANDROID_HOME` to your Android SDK path (e.g., `C:\Users\<YourUsername>\AppData\Local\Android\Sdk` on Windows).
- **Gradle Local Properties**: If `ANDROID_HOME` is not set globally, create/ensure `android/local.properties` exists with:
  ```properties
  sdk.dir=C:/Users/<YourUsername>/AppData/Local/Android/Sdk
  ```

### 2. Windows Path Length Workaround
On Windows systems, long paths can trigger compiler errors (`MAX_PATH` 260-character limit) for native libraries like `react-native-vector-icons`.
- We have configured the C++ build staging directory to be redirected to `C:/tmp/pl-cxx` in [android/app/build.gradle](file:///c:/Users/kanik/Desktop/Me/projects/Planner/android/app/build.gradle). 
- Ensure that the directory `C:/tmp` exists or can be written to by Gradle.

### 3. Testing Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Metro bundler:
   ```bash
   npm run start
   ```
3. Run on a simulator or device:
   - For Android (running/debugging local native code): `npm run android`
   - For iOS: `npm run ios`
   - If you encounter caching issues, restart the bundler with: `npx expo start --clear`

### 4. Code Quality & Formatting
- **TypeScript**: Validate TypeScript compiler checks:
  ```bash
  npx tsc --noEmit
  ```
- **Git Workflow**: Do not track generated `/android` or `/ios` directories. Keep native directories clean. Apply changes through `app.json` and config plugins where possible.

---

## 📂 Project Structure

```
├── app/                  # File-based routing navigation screens (Expo Router)
│   ├── (drawer)/         # Main drawer navigation screen layouts
│   ├── roadmap/          # Roadmap screens
│   ├── material/         # Material/course screens
│   └── _layout.tsx       # Root entry layout config
├── assets/               # Branding, splash screens, and icon resources
├── src/                  # Shared source code
│   ├── store/            # Zustand state stores (MMKV integration)
├── tailwind.config.js    # NativeWind styling configurations
├── app.json              # Expo configuration and plugins manifest
├── package.json          # Main dependencies & script execution configurations
└── tsconfig.json         # TypeScript configuration
```
