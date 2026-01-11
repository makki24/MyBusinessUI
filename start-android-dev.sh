#!/bin/bash

# MyBusinessUI Android Development Startup Script
# This script ensures proper Android SDK environment configuration

echo "🚀 Starting MyBusinessUI Android Development Environment..."

# Set Android SDK environment variables
export ANDROID_HOME=/home/syed/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin

# Verify Android SDK setup
echo "📱 Android SDK Path: $ANDROID_HOME"
echo "🔧 Available Android Tools:"
echo "   - ADB: $(which adb)"
echo "   - Emulator: $(which emulator)"

# Check available AVDs
echo "📲 Available Android Virtual Devices:"
emulator -list-avds

# Start Expo development server
echo "🎯 Starting Expo development server..."
echo "💡 After the server starts, press 'a' to open Android emulator"
echo "💡 Press 'i' to open iOS simulator (if available)"
echo "💡 Press 'w' to open web browser"
echo ""

# Start the development server
npm start
