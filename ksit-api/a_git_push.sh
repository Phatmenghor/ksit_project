#!/bin/bash

# Get current date and time
CURRENT_TIME=$(date "+%Y-%m-%d %H:%M:%S")

# Add all changes
git add .

# Commit with date-time message
git commit -m "Auto commit on $CURRENT_TIME"

# Push to development
git push origin production

echo "✅ Code pushed to 'production' branch at $CURRENT_TIME"
