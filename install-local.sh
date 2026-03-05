#!/bin/bash

# Today's Command - User-local installer (no sudo required)
# This script installs the app locally in the user's home directory

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_DIR="$HOME/.local/share/todays-command"
BIN_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
ICON_DIR="$HOME/.local/share/icons/hicolor/128x128/apps"

echo "========================================="
echo "Today's Command - User Installer"
echo "========================================="
echo ""

# Check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not found. Please install Node.js v18 or later:"
        echo "   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
        echo "   sudo apt-get install -y nodejs"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo "❌ Node.js version $NODE_VERSION is too old. Need v18+."
        exit 1
    fi
    
    echo "✓ Node.js: $(node --version)"
    
    # Check Rust
    if ! command -v cargo &> /dev/null; then
        echo "❌ Rust not found. Installing..."
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source "$HOME/.cargo/env"
    fi
    
    echo "✓ Rust: $(rustc --version)"
    echo ""
}

# Build application
build_app() {
    echo "Building application..."
    cd "$SCRIPT_DIR"
    
    # Export cargo path
    export PATH="$HOME/.cargo/bin:$PATH"
    
    # Install dependencies and build
    npm install
    npm run tauri:build
    
    echo "✓ Build complete"
    echo ""
}

# Install locally
install_local() {
    echo "Installing to $INSTALL_DIR..."
    
    # Create directories
    mkdir -p "$INSTALL_DIR"
    mkdir -p "$BIN_DIR"
    mkdir -p "$DESKTOP_DIR"
    mkdir -p "$ICON_DIR"
    
    # Copy binary
    cp "$SCRIPT_DIR/src-tauri/target/release/todays-command" "$INSTALL_DIR/"
    
    # Create wrapper script
    cat > "$BIN_DIR/todays-command" << 'EOF'
#!/bin/bash
export WEBKIT_DISABLE_COMPOSITING_MODE=1
exec "$HOME/.local/share/todays-command/todays-command" "$@"
EOF
    chmod +x "$BIN_DIR/todays-command"
    
    # Copy icon
    if [ -f "$SCRIPT_DIR/src-tauri/icons/128x128.png" ]; then
        cp "$SCRIPT_DIR/src-tauri/icons/128x128.png" "$ICON_DIR/todays-command.png"
    fi
    
    # Create desktop entry
    cat > "$DESKTOP_DIR/todays-command.desktop" << EOF
[Desktop Entry]
Name=Today's Command
Comment=Daily Linux, Python, and SQL command learning widget
Exec=$BIN_DIR/todays-command
Icon=$ICON_DIR/todays-command.png
Type=Application
Categories=Education;Development;
StartupNotify=true
Terminal=false
EOF
    
    chmod +x "$DESKTOP_DIR/todays-command.desktop"
    
    echo "✓ Installation complete"
    echo ""
}

# Update PATH
update_path() {
    if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
        echo "Adding $BIN_DIR to PATH..."
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.bashrc"
        echo "✓ PATH updated in .bashrc"
        echo "   Run 'source ~/.bashrc' or restart your terminal"
        echo ""
    fi
}

# Main
main() {
    check_prerequisites
    build_app
    install_local
    update_path
    
    echo "========================================="
    echo "✓ Installation complete!"
    echo "========================================="
    echo ""
    echo "You can now launch Today's Command by:"
    echo "  • Running: todays-command"
    echo "  • Finding it in your applications menu"
    echo ""
    echo "The app is installed in: $INSTALL_DIR"
    echo ""
}

main "$@"
