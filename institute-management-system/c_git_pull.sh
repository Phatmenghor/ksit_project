#!/bin/bash

# Get current date and time
CURRENT_TIME=$(date "+%Y-%m-%d %H:%M:%S")

git fetch

# Push to production branch
git pull origin production

echo "✅ Code pull form 'production' branch at $CURRENT_TIME"
