#!/bin/bash
# ==============================================================================
# KSIT iOS Deployment and App Store Connect Upload Script (Native Xcode 16)
# ==============================================================================
# This script automates the entire iOS release lifecycle:
#   1. Auto-increment build number in pubspec.yaml.
#   2. Clean and fetch Flutter dependencies.
#   3. Build the native iOS release IPA.
#   4. Verify the build.
#   5. Upload to App Store Connect (TestFlight) using altool.
# ==============================================================================

# Exit immediately if any command fails
set -e

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}          KSIT iOS Release & Deploy Pipeline       ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Configuration
APPLE_USER="eksit_channel@ksit.edu.kh"
APP_PASS="oznr-kukj-pabt-pguy"
SIGNING_IDENTITY="Apple Distribution: TONG VUTHEA (D28VQR78KT)"
PROJECT_DIR="$(pwd)"
IPA_PATH="${PROJECT_DIR}/build/ios/ipa/ims ksit.ipa"

# Target entry point (use "lib/main_dev.dart" for development, or "lib/main.dart" for production)
TARGET_ENTRY_POINT="lib/main_dev.dart"

# Step 0: Auto-increment build number in pubspec.yaml
echo -e "${BLUE}🔢 Step 0: Auto-incrementing build number in pubspec.yaml...${NC}"
python3 -c "
import re
pubspec_path = 'pubspec.yaml'
with open(pubspec_path, 'r') as f:
    content = f.read()

pattern = r'version:\s*(\d+\.\d+\.\d+)\+(\d+)'
match = re.search(pattern, content)
if match:
    version_base = match.group(1)
    build_number = int(match.group(2))
    new_build_number = build_number + 1
    new_version = f'version: {version_base}+{new_build_number}'
    new_content = re.sub(pattern, new_version, content)
    with open(pubspec_path, 'w') as f:
        f.write(new_content)
    print(f'✅ Successfully bumped build number in pubspec.yaml: {version_base}+{build_number} -> {version_base}+{new_build_number}')
else:
    print('⚠️  Warning: Could not find version line in pubspec.yaml. Skipping auto-increment.')
"

# Step 1: Clean and Prepare
echo -e "\n${BLUE}🧹 Step 1: Cleaning Flutter build artifacts...${NC}"
flutter clean
echo -e "${BLUE}📦 Getting Flutter dependencies...${NC}"
flutter pub get

# Step 2: Build release IPA (standard native build using stable Xcode 16)
echo -e "\n${BLUE}🍎 Step 2: Building standard iOS Release IPA (${TARGET_ENTRY_POINT})...${NC}"
flutter build ipa --release -t "$TARGET_ENTRY_POINT"

# Step 3: Verification / Check
echo -e "\n${BLUE}🔍 Step 3: Verifying the build metadata...${NC}"
TEMP_VERIFY="/tmp/ipa_verify_final"
if [ -d "$TEMP_VERIFY" ]; then rm -rf "$TEMP_VERIFY"; fi
mkdir -p "$TEMP_VERIFY"

unzip -q "$IPA_PATH" -d "$TEMP_VERIFY"
APP_BUNDLE=$(find "$TEMP_VERIFY" -name "*.app" | head -n 1)
BINARY_PATH="${APP_BUNDLE}/Runner"

echo -e "\n${YELLOW}=== VERIFICATION STATUS ===${NC}"
SDK_VER=$(otool -l "$BINARY_PATH" | grep -A 5 "LC_BUILD_VERSION" | grep "sdk" | tr -d ' ' || echo "sdk not found")
echo -e "Mach-O Binary SDK:    ${GREEN}${SDK_VER}${NC}"

PLIST_PLATFORM_VER=$(plutil -extract DTPlatformVersion raw "$APP_BUNDLE/Info.plist" || echo "not found")
echo -e "Info.plist SDK Version:${GREEN}${PLIST_PLATFORM_VER}${NC}"

PLIST_SDK_NAME=$(plutil -extract DTSDKName raw "$APP_BUNDLE/Info.plist" || echo "not found")
echo -e "Info.plist SDK Name:   ${GREEN}${PLIST_SDK_NAME}${NC}"

PLIST_XCODE_VER=$(plutil -extract DTXcode raw "$APP_BUNDLE/Info.plist" || echo "not found")
echo -e "Info.plist Xcode Ver:  ${GREEN}${PLIST_XCODE_VER}${NC}"

# Clean verification folder
rm -rf "$TEMP_VERIFY"

# Step 4: Upload
echo -e "\n${BLUE}☁️  Step 4: Uploading IPA to App Store Connect / TestFlight...${NC}"
echo -e "Uploading using user account: ${YELLOW}${APPLE_USER}${NC}"

xcrun altool --upload-app --type ios \
  -f "$IPA_PATH" \
  -u "$APPLE_USER" \
  -p "$APP_PASS"

echo -e "\n${GREEN}==================================================${NC}"
echo -e "${GREEN}🎉 iOS DEPLOYMENT AND UPLOAD COMPLETED SUCCESSFULLY!${NC}"
echo -e "${GREEN}==================================================${NC}"
