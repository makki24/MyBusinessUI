#!/bin/bash

# Android Environment Setup Script for MyBusinessUI
# This script provides multiple methods to configure Android SDK environment

echo "🔧 Android SDK Environment Setup for MyBusinessUI"
echo "=================================================="

# Method 1: Add to .bashrc (if not already present)
setup_bashrc() {
    echo "📝 Setting up .bashrc configuration..."
    
    # Check if Android configuration already exists
    if ! grep -q "ANDROID_HOME" ~/.bashrc; then
        echo "" >> ~/.bashrc
        echo "# Android SDK Configuration for MyBusinessUI" >> ~/.bashrc
        echo "export ANDROID_HOME=/home/syed/Android/Sdk" >> ~/.bashrc
        echo "export PATH=\$PATH:\$ANDROID_HOME/emulator" >> ~/.bashrc
        echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> ~/.bashrc
        echo "export PATH=\$PATH:\$ANDROID_HOME/tools" >> ~/.bashrc
        echo "export PATH=\$PATH:\$ANDROID_HOME/tools/bin" >> ~/.bashrc
        echo "✅ Android configuration added to .bashrc"
    else
        echo "ℹ️  Android configuration already exists in .bashrc"
    fi
}

# Method 2: Add to .profile (alternative)
setup_profile() {
    echo "📝 Setting up .profile configuration..."
    
    if ! grep -q "ANDROID_HOME" ~/.profile; then
        echo "" >> ~/.profile
        echo "# Android SDK Configuration for MyBusinessUI" >> ~/.profile
        echo "export ANDROID_HOME=/home/syed/Android/Sdk" >> ~/.profile
        echo "export PATH=\$PATH:\$ANDROID_HOME/emulator" >> ~/.profile
        echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> ~/.profile
        echo "export PATH=\$PATH:\$ANDROID_HOME/tools" >> ~/.profile
        echo "export PATH=\$PATH:\$ANDROID_HOME/tools/bin" >> ~/.profile
        echo "✅ Android configuration added to .profile"
    else
        echo "ℹ️  Android configuration already exists in .profile"
    fi
}

# Method 3: Create environment file for current session
setup_current_session() {
    echo "🚀 Setting up current session environment..."
    export ANDROID_HOME=/home/syed/Android/Sdk
    export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin
    echo "✅ Environment variables set for current session"
}

# Verification function
verify_setup() {
    echo "🔍 Verifying Android SDK setup..."
    echo "ANDROID_HOME: $ANDROID_HOME"
    
    if [ -d "$ANDROID_HOME" ]; then
        echo "✅ Android SDK directory exists"
    else
        echo "❌ Android SDK directory not found"
        return 1
    fi
    
    # Check for essential tools
    if command -v adb >/dev/null 2>&1; then
        echo "✅ ADB is available: $(which adb)"
    else
        echo "⚠️  ADB not found in PATH"
    fi
    
    if command -v emulator >/dev/null 2>&1; then
        echo "✅ Emulator is available: $(which emulator)"
        echo "📱 Available AVDs:"
        emulator -list-avds 2>/dev/null || echo "   No AVDs found or emulator not accessible"
    else
        echo "⚠️  Emulator not found in PATH"
    fi
}

# Main execution
main() {
    echo "Starting Android SDK environment setup..."
    echo ""
    
    # Set up for current session first
    setup_current_session
    echo ""
    
    # Set up permanent configuration
    setup_bashrc
    setup_profile
    echo ""
    
    # Verify the setup
    verify_setup
    echo ""
    
    echo "🎉 Setup complete!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Close and reopen your terminal, OR run: source ~/.bashrc"
    echo "2. Navigate to your project: cd /mnt/mybackup/mybusiness/UI/MyBusinessUI"
    echo "3. Start Expo: npm start"
    echo "4. Press 'a' to open Android emulator"
    echo ""
    echo "💡 If you still encounter issues, use the start-android-dev.sh script"
}

# Run main function
main
