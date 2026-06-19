#!/bin/bash

echo "🧹 Starting cleanup process..."
sleep 2

# Clean Android
echo "📱 Cleaning Android..."
cd android
./gradlew clean
cd ..
sleep 3

# Flutter clean
echo "🗑️  Running Flutter clean..."
flutter clean
sleep 2

# Get dependencies
echo "📦 Getting Flutter dependencies..."
flutter pub get
sleep 3

# Recreate iOS platform if needed
echo "🍎 Setting up iOS platform..."
if [ ! -d "ios" ]; then
    echo "⚠️  iOS directory not found. Regenerating..."
    flutter create . --platforms=ios
    sleep 3
fi

# Install iOS pods
echo "💎 Installing CocoaPods dependencies..."
cd ios
pod repo update
sleep 2
pod install
cd ..
sleep 2

flutter build ios --config-only --release

echo "✅ All done! Your project is ready."