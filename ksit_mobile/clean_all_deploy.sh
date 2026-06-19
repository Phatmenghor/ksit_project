#!/bin/bash

# Set current date (YYYYMMDD)
CURRENT_DAY=$(date +"%Y%m%d")
APK_NAME="KSIT_v1_development_${CURRENT_DAY}.apk"

# Clean everything first (from project root)
echo "🧹 Cleaning Flutter project..."
flutter clean

echo "🧹 Cleaning Android project..."
cd android
./gradlew clean
cd ..

echo "📦 Getting Flutter dependencies..."
flutter pub get

echo "🍎 Installing iOS pods..."
cd ios
pod install
cd ..

echo "🤖 Building Android APK release..."
flutter build apk --release

echo "📱 Copying APK to Desktop with date-based name..."
cp build/app/outputs/flutter-apk/app-release.apk ~/Desktop/production/$APK_NAME

echo "🍎 Building iOS release configuration..."
flutter build ios --config-only --release

echo "✅ Build process completed!"
echo "📦 APK saved as: ~/Desktop/production/$APK_NAME"
