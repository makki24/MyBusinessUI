# Development Build Guide for MyBusinessUI

## Problem Solved
**Original Error**: `CommandError: No development build (com.syedsons.mybusiness) for this project is installed. Please make and install a development build on the device first.`

## Solution Overview
This guide provides a comprehensive workflow to create and install development builds for the MyBusinessUI Expo React Native project on Android emulators.

## Prerequisites ✅
- [x] Android SDK configured (`ANDROID_HOME` set to `/home/syed/Android/Sdk`)
- [x] Android emulator (Pixel_9a) available and running
- [x] EAS CLI installed and configured
- [x] Expo development server environment set up
- [x] Google Services JSON file created for development builds

## Development Build Workflow

### Method 1: EAS Build Cloud Service (Recommended)

#### Step 1: Initiate EAS Build
```bash
cd /mnt/mybackup/mybusiness/UI/MyBusinessUI
eas build --platform android --profile development --non-interactive
```

#### Step 2: Monitor Build Progress
- Build URL: https://expo.dev/accounts/makki24/projects/MyBusinessUI/builds/
- The build will be queued and processed in the cloud
- You can monitor progress via the provided URL

#### Step 3: Download APK
Once the build completes:
```bash
# Option A: Download via EAS CLI
eas build:list --platform android --limit 1
# Copy the download URL from the output

# Option B: Download from EAS Dashboard
# Visit the build URL and download the APK file
```

#### Step 4: Install on Emulator
```bash
# Ensure emulator is running
export ANDROID_HOME=/home/syed/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin

# Check emulator status
adb devices

# Install the downloaded APK
adb install path/to/downloaded-app.apk
```

### Method 2: Automated Script (All-in-One)

Use the comprehensive build and install script:
```bash
cd /mnt/mybackup/mybusiness/UI/MyBusinessUI
./build-and-install-dev.sh
```

This script will:
- Check/start the Android emulator
- Create the development build using EAS Build
- Download and install the APK automatically
- Start the Expo development server

### Method 3: Local Build (Fallback)

If EAS Build is unavailable:
```bash
# Ensure Google Services JSON exists
ls assets/google-services.json

# Run Expo prebuild
npx expo prebuild --platform android --clear

# Build locally using Gradle
cd android
./gradlew assembleDebug

# Install the local APK
cd ..
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## Configuration Details

### EAS Build Profile (development)
```json
{
  "development": {
    "developmentClient": true,
    "distribution": "internal",
    "channel": "development",
    "env": {
      "EXPO_PUBLIC_URL": "http://129.213.146.93:8085",
      "APP_VARIANT": "development",
      "EXPO_PUBLIC_ANDROID_CLIENT_ID": "82740835529-a19jnqjanlffvd06ceqfol0hkoqe2k0h.apps.googleusercontent.com",
      "EXPO_PUBLIC_CLIENT_ID": "82740835529-m96lhvjc8lgaj73liqurra8eksrebalu.apps.googleusercontent.com"
    }
  }
}
```

### App Configuration (development)
- **Package Name**: `com.syedsons.mybusiness.dev`
- **Development Client**: Enabled
- **Google Services**: Configured for development environment
- **Runtime Version**: SDK Version policy

## Testing the Development Build

### Step 1: Start Expo Development Server
```bash
cd /mnt/mybackup/mybusiness/UI/MyBusinessUI
npm start
```

### Step 2: Connect Development Build to Server
1. Open the installed development build app on your emulator
2. The app should automatically detect the development server
3. If not, manually enter the development server URL: `http://localhost:8081`

### Step 3: Verify Hot Reloading
1. Make a small change to your React Native code
2. Save the file
3. The app should automatically reload with your changes

## Troubleshooting

### Build Issues

**Issue**: EAS Build fails with authentication error
```bash
# Solution: Login to EAS
eas login
```

**Issue**: Google Services JSON missing
```bash
# Solution: Use the temporary file created in assets/google-services.json
# Or obtain the real file from Firebase Console
```

**Issue**: Local build fails
```bash
# Solution: Clean and retry
npx expo prebuild --platform android --clear --clean
cd android && ./gradlew clean && ./gradlew assembleDebug
```

### Installation Issues

**Issue**: APK installation fails
```bash
# Solution: Uninstall existing app first
adb uninstall com.syedsons.mybusiness.dev
adb install path/to/your-app.apk
```

**Issue**: Emulator not detected
```bash
# Solution: Restart ADB and check devices
adb kill-server
adb start-server
adb devices
```

### Connection Issues

**Issue**: Development build can't connect to server
1. Check that both emulator and development server are on the same network
2. Verify the server URL in the development build
3. Ensure no firewall is blocking the connection
4. Try using the IP address instead of localhost

**Issue**: Hot reloading not working
1. Shake the device/emulator to open developer menu
2. Enable "Fast Refresh"
3. Check that the Metro bundler is running

## Quick Reference Commands

### Essential Commands
```bash
# Start development workflow
./build-and-install-dev.sh

# Check emulator status
adb devices

# Install APK
adb install path/to/app.apk

# Start development server
npm start

# Build with EAS
eas build --platform android --profile development

# List recent builds
eas build:list --platform android --limit 5
```

### File Locations
- **EAS Config**: `eas.json`
- **App Config**: `app.config.ts`
- **Build Script**: `scripts/build.sh`
- **Automated Script**: `build-and-install-dev.sh`
- **Google Services**: `assets/google-services.json`

## Development Build Benefits

✅ **Hot Reloading**: Instant code updates without rebuilding
✅ **Native Debugging**: Full access to native debugging tools
✅ **Custom Native Code**: Support for custom native modules
✅ **Production-Like Environment**: Closer to production build behavior
✅ **Offline Development**: No need for Expo Go app limitations

## Security Notes

- Development builds include debugging capabilities
- Google Services JSON contains placeholder values for development
- Never use development builds for production distribution
- Environment variables are configured for development endpoints

---

**Status**: ✅ **IMPLEMENTED** - Development build workflow established
**Test Email**: syed@netable.com.au
**Build Profile**: development (com.syedsons.mybusiness.dev)
**Target Emulator**: Pixel_9a (emulator-5554)
**Last Updated**: 2025-09-15T01:21:00+10:00
