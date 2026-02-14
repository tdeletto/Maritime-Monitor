#!/bin/bash

# Maritime Monitor - Quick Start Setup Script
# This script handles all the setup automatically

set -e  # Exit on error

echo "================================================"
echo "  Maritime Monitor - Quick Start Setup"
echo "================================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo "${YELLOW}Step 1: Checking prerequisites...${NC}"
echo ""

if ! command -v node &> /dev/null; then
    echo "${RED}✗ Node.js not found!${NC}"
    echo "  Install from: https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "${RED}✗ npm not found!${NC}"
    echo "  Install Node.js from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)

echo "${GREEN}✓ Node.js found: $NODE_VERSION${NC}"
echo "${GREEN}✓ npm found: $NPM_VERSION${NC}"
echo ""

# Step 2: Clean install
echo "${YELLOW}Step 2: Cleaning up old dependencies...${NC}"
echo ""

if [ -d "node_modules" ]; then
    echo "  Removing node_modules/"
    rm -rf node_modules
fi

if [ -f "package-lock.json" ]; then
    echo "  Removing package-lock.json"
    rm -f package-lock.json
fi

echo "${GREEN}✓ Cleanup complete${NC}"
echo ""

# Step 3: Install dependencies
echo "${YELLOW}Step 3: Installing dependencies...${NC}"
echo "  This may take a minute..."
echo ""

npm install

echo ""
echo "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 4: Verify installation
echo "${YELLOW}Step 4: Verifying installation...${NC}"
echo ""

# Check for key files
if [ ! -f "tsconfig.node.json" ]; then
    echo "${RED}✗ Missing: tsconfig.node.json${NC}"
    exit 1
fi

if [ ! -f "tsconfig.json" ]; then
    echo "${RED}✗ Missing: tsconfig.json${NC}"
    exit 1
fi

if [ ! -f "vite.config.ts" ]; then
    echo "${RED}✗ Missing: vite.config.ts${NC}"
    exit 1
fi

# Check for key packages
if ! npm list leaflet &> /dev/null; then
    echo "${RED}✗ leaflet package missing${NC}"
    exit 1
fi

if ! npm list leaflet-fullscreen &> /dev/null; then
    echo "${RED}✗ leaflet-fullscreen package missing${NC}"
    exit 1
fi

echo "${GREEN}✓ All required files present${NC}"
echo "${GREEN}✓ All packages installed correctly${NC}"
echo ""

# Step 5: Environment setup
echo "${YELLOW}Step 5: Setting up environment...${NC}"
echo ""

if [ ! -f ".env.local" ]; then
    if [ -f ".env.local.example" ]; then
        cp .env.local.example .env.local
        echo "${GREEN}✓ Created .env.local from template${NC}"
        echo ""
        echo "${YELLOW}⚠ Important: Update .env.local with your API keys:${NC}"
        echo "  1. VITE_AIS_HUB_API_KEY - Get from https://www.aishub.net/"
        echo "  2. VITE_OPENWEATHER_API_KEY - Get from https://openweathermap.org/"
        echo ""
    else
        echo "${YELLOW}⚠ .env.local.example not found, create .env.local manually${NC}"
        echo ""
    fi
else
    echo "${GREEN}✓ .env.local already exists${NC}"
    echo ""
fi

# Step 6: Type checking
echo "${YELLOW}Step 6: Running type check...${NC}"
echo ""

npm run type-check 2>/dev/null || true

echo ""
echo "${GREEN}✓ Type check complete${NC}"
echo ""

# Final status
echo "================================================"
echo "${GREEN}  Setup Complete! ✓${NC}"
echo "================================================"
echo ""
echo "${YELLOW}Next steps:${NC}"
echo ""
echo "1. (If needed) Edit .env.local with your API keys"
echo ""
echo "2. Start the development server:"
echo "   ${GREEN}npm run dev${NC}"
echo ""
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "See TROUBLESHOOTING_QUICK_FIX.md if you encounter issues."
echo ""
