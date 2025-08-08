#!/bin/bash
# run_tests.sh - Local test runner for Selenium tests

echo "🧪 MoodCast Selenium Test Runner"
echo "================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Set up test environment
export COMPOSE_PROJECT_NAME=moodcast-test
export MONGO_PASSWORD=testpassword
export JWT_SECRET=test-jwt-secret

# Function to cleanup
cleanup() {
    echo "🧹 Cleaning up test environment..."
    docker-compose down -v
}

# Trap to ensure cleanup on exit
trap cleanup EXIT

echo "🔨 Building application..."
docker-compose build app

echo "🚀 Starting application and database..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
timeout=60
while [ $timeout -gt 0 ]; do
    if curl -f http://localhost:5173 >/dev/null 2>&1; then
        echo "✅ Services are ready!"
        break
    fi
    echo "⏳ Waiting... ($timeout seconds remaining)"
    sleep 2
    timeout=$((timeout - 2))
done

if [ $timeout -eq 0 ]; then
    echo "❌ Error: Services failed to start in time"
    docker-compose logs
    exit 1
fi

# Install Python dependencies if needed
echo "📦 Checking Python dependencies..."
if ! python3 -c "import selenium" 2>/dev/null; then
    echo "📦 Installing test dependencies..."
    pip3 install --break-system-packages -r tests/requirements.txt
fi

# Check if Chrome is available (for local testing)
if ! command -v google-chrome &> /dev/null && ! command -v chromium-browser &> /dev/null; then
    echo "⚠️  Warning: Chrome/Chromium not found. Installing via webdriver-manager..."
fi

# Run Selenium tests
echo "🧪 Running Selenium tests..."
export APP_URL="http://localhost:5173"

python3 tests/test_moodcast.py

# Capture exit code
TEST_EXIT_CODE=$?

# Display results
echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed."
    echo "📋 Check logs for more details:"
    echo "  docker-compose logs app"
    echo "  docker-compose logs mongodb"
fi

# Show container status
echo ""
echo "📊 Container status:"
docker-compose ps

exit $TEST_EXIT_CODE