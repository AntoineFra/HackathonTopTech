#!/usr/bin/env fish

# Setup script for Territory 06 Data Portal
# This script helps set up the development environment

echo "🚀 Setting up Territory 06 Data Portal..."
echo ""

# Check if pnpm is installed
if not command -v pnpm &> /dev/null
    echo "❌ pnpm is not installed. Please install it first:"
    echo "   npm install -g pnpm"
    exit 1
end

echo "✓ pnpm found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

if test $status -eq 0
    echo "✓ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
end

echo ""

# Create .env.local if it doesn't exist
if not test -f .env.local
    echo "📝 Creating .env.local from template..."
    cp .env.example .env.local
    echo "✓ .env.local created. Please add your API keys!"
    echo ""
    echo "⚠️  Important: Edit .env.local and add your API keys before running the app"
else
    echo "✓ .env.local already exists"
end

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env.local and add your API keys"
echo "  2. Implement AI service in lib/ai-service.ts"
echo "  3. Run 'pnpm dev' to start the development server"
echo "  4. Open http://localhost:3000 in your browser"
echo ""
echo "📚 Check AI_INTEGRATION.md for detailed integration guide"
echo ""
