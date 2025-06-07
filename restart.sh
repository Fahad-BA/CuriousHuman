#!/bin/bash

PROJECT_DIR="$(dirname "$0")"
FRONTEND_DIR="$PROJECT_DIR/ask-frontend"
BUILD_DIR="$FRONTEND_DIR/build"

echo "Step 1: Put site in maintenance mode"
echo "⚙️  Enabling maintenance mode..."
cp "$FRONTEND_DIR/public/maintenance.html" "$BUILD_DIR/index.html"

echo "Optional: reload serve or nginx if needed"

echo "Step 2: Build React app"
echo "📦 Building frontend..."
cd "$FRONTEND_DIR" || exit 1
npm run build || {
  echo "❌ Build failed."
  exit 1
}

echo "Step 3: Restart PM2 services"
cd "$PROJECT_DIR" || exit 1
echo "♻️ Restarting PM2 services..."
pm2 restart ask-frontend ask-backend --update-env && echo "✅ Restart complete." || echo "❌ PM2 restart failed."
