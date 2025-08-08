#!/bin/bash
# run_local_tests.sh - Simple local test runner for development

echo "🧪 MoodCast Local Selenium Tests"
echo "================================="

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "❌ Python not found. Please install Python first."
        exit 1
    else
        PYTHON_CMD=python
    fi
else
    PYTHON_CMD=python3
fi

echo "Using Python: $PYTHON_CMD"

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    if ! command -v pip &> /dev/null; then
        echo "❌ pip not found. Please install pip first."
        exit 1
    else
        PIP_CMD=pip
    fi
else
    PIP_CMD=pip3
fi

# Install test dependencies if needed
echo "📦 Installing test dependencies..."
if ! $PYTHON_CMD -c "import selenium" 2>/dev/null; then
    echo "Installing Selenium and dependencies..."
    if ! $PIP_CMD install -r tests/requirements.txt 2>/dev/null; then
        echo "⚠️  Standard pip install failed, trying with --break-system-packages..."
        $PIP_CMD install -r tests/requirements.txt --break-system-packages
    fi
else
    echo "✅ Dependencies already installed"
fi

# Check if Chrome/Chromium is available for local testing
if [[ -f "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]] || command -v google-chrome &> /dev/null || command -v chromium-browser &> /dev/null; then
    echo "✅ Chrome browser found"
else
    echo "⚠️  Chrome not found. Please install Google Chrome or Chromium."
    echo "   macOS: brew install --cask google-chrome"
    echo "   Ubuntu: sudo apt install google-chrome-stable"
    exit 1
fi

# Set environment variables for local testing
export APP_URL="${APP_URL:-http://localhost:5173}"  # Use provided APP_URL or default
export SELENIUM_URL=""  # Empty means use local Chrome driver

echo "🔍 Testing against: $APP_URL"
echo "🌐 Using local Chrome driver"

# Check if the app is running
echo "⏳ Checking if app is running..."
if ! curl -s $APP_URL > /dev/null; then
    echo "❌ App is not running on $APP_URL"
    echo "💡 Please start the app first:"
    echo "   ./start-dev.sh"
    echo ""
    echo "🔄 Or start manually:"
    echo "   Terminal 1: npm run dev"
    echo "   Terminal 2: export PATH=\"/opt/homebrew/bin:\$PATH\" && node server/index.js"
    exit 1
fi

echo "✅ App is running!"

# Run the tests
echo "🚀 Running Selenium tests..."
$PYTHON_CMD tests/test_moodcast.py

# Capture exit code
TEST_EXIT_CODE=$?

# Display results
echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "🎉 All tests passed!"
else
    echo "❌ Some tests failed (exit code: $TEST_EXIT_CODE)"
fi

exit $TEST_EXIT_CODE 