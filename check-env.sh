#!/bin/bash

# Quick setup script for developers/testers
# This verifies the environment and builds the app

set -e

echo "========================================="
echo "Today's Command - Quick Setup"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -ge 18 ]; then
        echo -e "${GREEN}✓${NC} $NODE_VERSION"
    else
        echo -e "${RED}✗${NC} Version $NODE_VERSION (need v18+)"
        exit 1
    fi
else
    echo -e "${RED}✗${NC} Not found"
    echo "Install: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

# Check Rust
echo -n "Checking Rust... "
if command -v cargo &> /dev/null; then
    RUST_VERSION=$(rustc --version)
    echo -e "${GREEN}✓${NC} $RUST_VERSION"
else
    echo -e "${YELLOW}!${NC} Not found, will install"
fi

# Check system deps (Debian/Ubuntu only)
if command -v dpkg &> /dev/null; then
    echo -n "Checking system dependencies... "
    MISSING_DEPS=""
    
    if ! dpkg -l | grep -q "libwebkit2gtk-4.1"; then
        MISSING_DEPS="$MISSING_DEPS libwebkit2gtk-4.1-dev"
    fi
    
    if ! dpkg -l | grep -q "libssl-dev"; then
        MISSING_DEPS="$MISSING_DEPS libssl-dev"
    fi
    
    if [ -z "$MISSING_DEPS" ]; then
        echo -e "${GREEN}✓${NC} All present"
    else
        echo -e "${YELLOW}!${NC} Missing:$MISSING_DEPS"
        echo "Install: sudo apt-get update && sudo apt-get install -y$MISSING_DEPS"
        exit 1
    fi
fi

echo ""
echo "Environment looks good!"
echo ""
echo "Run one of:"
echo "  ./install.sh          - System-wide install (requires sudo)"
echo "  ./install-local.sh    - User install (no sudo)"
echo "  npm run tauri:dev     - Development mode"
echo ""
