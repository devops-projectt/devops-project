#!/bin/bash
# start-dev.sh - Start both frontend and backend for development

echo "🚀 Starting MoodCast Development Servers"
echo "========================================"

# Export PATH for Homebrew Node.js FIRST
export PATH="/opt/homebrew/bin:$PATH"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    echo "💡 Tried looking in: $PATH"
    exit 1
fi

echo "✅ Using Node.js: $(which node)"
echo "✅ Node.js version: $(node --version)"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating basic .env file..."
    cat > .env << 'EOF'
MONGODB_URI=mongodb+srv://mooduser:mood2402@moodcast-cluster.8nvomyn.mongodb.net/moodcast?retryWrites=true&w=majority&appName=moodcast-cluster
LISTEN_NOTES_API_KEY=your_listennotes_api_key_here
JWT_SECRET=dev-secret-key
PORT=3001
EOF
fi

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    jobs -p | xargs -r kill
    exit
}

# Trap to ensure cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Start backend server in background
echo "📡 Starting backend server on port 3001..."
node server/index.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! curl -s http://localhost:3001 > /dev/null; then
    echo "⚠️  Backend server may not have started properly, but continuing..."
fi

# Start frontend server in background
echo "🎨 Starting frontend server on port 5173..."
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 5

echo ""
echo "✅ Development servers are running:"
echo "   📡 Backend:  http://localhost:3001"
echo "   🎨 Frontend: http://localhost:5173 (or next available port)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Keep script running and wait for user interruption
wait 