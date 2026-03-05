#!/bin/bash

# Today's Command Linux Widget - Fully Automated Installer
# This script handles everything: dependencies, build, and installation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory (where this script is located)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="todays-command"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Header
echo "========================================="
echo "Today's Command - Linux Widget"
echo "Fully Automated Installer"
echo "========================================="
echo ""

# Check if running as root for system installation
if [ "$EUID" -eq 0 ]; then
    log_warning "Running as root. Build will run as current user, only installation will use sudo."
    RUNNING_AS_ROOT=true
else
    RUNNING_AS_ROOT=false
fi

# Get the actual user (even if running with sudo)
if [ "$SUDO_USER" ]; then
    ACTUAL_USER="$SUDO_USER"
    ACTUAL_HOME="$(getent passwd "$SUDO_USER" | cut -d: -f6)"
else
    ACTUAL_USER="$(whoami)"
    ACTUAL_HOME="$HOME"
fi

log_info "Installing for user: $ACTUAL_USER"
log_info "Project directory: $SCRIPT_DIR"
log_info ""

# Detect Linux distribution
detect_distro() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO="$ID"
        DISTRO_LIKE="$ID_LIKE"
    elif type lsb_release >/dev/null 2>&1; then
        DISTRO=$(lsb_release -si | tr '[:upper:]' '[:lower:]')
    elif [ -f /etc/redhat-release ]; then
        DISTRO="rhel"
    else
        DISTRO="unknown"
    fi
    
    log_info "Detected distribution: $DISTRO"
}

# Install Node.js automatically
install_nodejs() {
    log_info "Installing Node.js..."
    
    case "$DISTRO" in
        ubuntu|debian|pop|linuxmint|elementary|zorin)
            # Install dependencies
            apt-get update -qq
            apt-get install -y -qq curl ca-certificates gnupg
            
            # Setup NodeSource repository for Node.js 20
            curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
            apt-get install -y -qq nodejs
            ;;
            
        fedora|centos|rhel|rocky|almalinux)
            # Install Node.js 20
            curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
            if command -v dnf &> /dev/null; then
                dnf install -y nodejs
            else
                yum install -y nodejs
            fi
            ;;
            
        arch|manjaro|endeavouros)
            pacman -Sy --noconfirm nodejs npm
            ;;
            
        opensuse*|suse*)
            zypper install -y nodejs20 npm
            ;;
            
        alpine)
            apk add --no-cache nodejs npm
            ;;
            
        *)
            # Generic install using n (Node version manager)
            log_info "Using n (Node version manager) for generic install..."
            curl -fsSL https://raw.githubusercontent.com/tj/n/master/bin/n | bash -s lts
            npm install -g n
            n lts
            ;;
    esac
    
    # Verify installation
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_success "Node.js installed: $NODE_VERSION"
    else
        log_error "Node.js installation failed"
        exit 1
    fi
}

# Install Rust automatically
install_rust() {
    log_info "Installing Rust..."
    
    # Install Rust via rustup
    if [ "$RUNNING_AS_ROOT" = true ]; then
        # Install as the actual user, not root
        su - "$ACTUAL_USER" -c 'curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y'
    else
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    fi
    
    # Source cargo environment
    export PATH="$ACTUAL_HOME/.cargo/bin:$PATH"
    
    # Verify installation
    if command -v cargo &> /dev/null; then
        RUST_VERSION=$(rustc --version)
        log_success "Rust installed: $RUST_VERSION"
    else
        log_error "Rust installation failed"
        exit 1
    fi
}

# Install system dependencies for Tauri
install_system_deps() {
    log_info "Installing system dependencies for Tauri..."
    
    case "$DISTRO" in
        ubuntu|debian|pop|linuxmint|elementary|zorin)
            apt-get update -qq
            apt-get install -y -qq \
                libwebkit2gtk-4.1-dev \
                build-essential \
                curl \
                wget \
                file \
                libxdo-dev \
                libssl-dev \
                libayatana-appindicator3-dev \
                librsvg2-dev \
                pkg-config
            ;;
            
        fedora)
            dnf install -y \
                webkit2gtk4.1-devel \
                openssl-devel \
                curl \
                wget \
                libappindicator-gtk3-devel \
                librsvg2-devel
            ;;
            
        centos|rhel|rocky|almalinux)
            yum install -y \
                webkit2gtk4.1-devel \
                openssl-devel \
                curl \
                wget \
                libappindicator-gtk3-devel \
                librsvg2-devel
            ;;
            
        arch|manjaro|endeavouros)
            pacman -Syu --noconfirm \
                webkit2gtk-4.1 \
                base-devel \
                curl \
                wget \
                openssl \
                appmenu-gtk-module \
                gtk3 \
                libappindicator-gtk3 \
                librsvg \
                libvips
            ;;
            
        opensuse*|suse*)
            zypper install -y \
                webkit2gtk3-devel \
                libopenssl-devel \
                curl \
                wget \
                libappindicator3-1 \
                librsvg-devel
            ;;
            
        *)
            log_warning "Unknown distribution. Attempting to install common dependencies..."
            log_warning "You may need to manually install: webkit2gtk, openssl, curl, librsvg"
            ;;
    esac
    
    log_success "System dependencies installed"
}

# Build the application
build_app() {
    log_info "Building Today's Command..."
    log_info "This may take a few minutes..."
    echo ""
    
    cd "$SCRIPT_DIR"
    
    # Ensure we're using the correct user's home
    export HOME="$ACTUAL_HOME"
    export PATH="$ACTUAL_HOME/.cargo/bin:$PATH"
    export PATH="$ACTUAL_HOME/.local/bin:$PATH"
    
    # Install npm dependencies
    log_info "Installing npm dependencies..."
    if [ "$RUNNING_AS_ROOT" = true ]; then
        su - "$ACTUAL_USER" -c "cd '$SCRIPT_DIR' && npm install"
    else
        npm install
    fi
    
    # Build the application
    log_info "Building Tauri application..."
    if [ "$RUNNING_AS_ROOT" = true ]; then
        su - "$ACTUAL_USER" -c "cd '$SCRIPT_DIR' && export PATH='$ACTUAL_HOME/.cargo/bin:$PATH' && npm run tauri:build"
    else
        npm run tauri:build
    fi
    
    log_success "Build completed!"
}

# Install the .deb package
install_deb() {
    log_info "Installing package..."
    
    DEB_FILE=$(find "$SCRIPT_DIR/src-tauri/target/release/bundle/deb" -name "*.deb" -type f | head -1)
    
    if [ -z "$DEB_FILE" ]; then
        log_error "Could not find built .deb package"
        exit 1
    fi
    
    log_info "Found package: $DEB_FILE"
    
    if [ "$RUNNING_AS_ROOT" = true ]; then
        dpkg -i "$DEB_FILE" || true
        apt-get install -f -y
    else
        sudo dpkg -i "$DEB_FILE" || true
        sudo apt-get install -f -y
    fi
    
    log_success "Package installed!"
}

# Main installation flow
main() {
    detect_distro
    
    # Check if we need to install dependencies
    local NEEDS_BUILD=false
    
    # Check for pre-built .deb
    DEB_FILE=$(find "$SCRIPT_DIR" -name "*.deb" -type f 2>/dev/null | head -1)
    if [ -n "$DEB_FILE" ]; then
        log_info "Found pre-built package: $DEB_FILE"
        log_info "Installing..."
        if [ "$RUNNING_AS_ROOT" = true ]; then
            dpkg -i "$DEB_FILE" || true
            apt-get install -f -y
        else
            sudo dpkg -i "$DEB_FILE" || true
            sudo apt-get install -f -y
        fi
        log_success "Installation complete!"
        echo ""
        echo "You can now launch Today's Command from your applications menu"
        echo "Or run: todays-command"
        exit 0
    fi
    
    # Need to build from source
    NEEDS_BUILD=true
    log_info "No pre-built package found. Building from source..."
    echo ""
    
    # Install system dependencies (needs root)
    if [ "$RUNNING_AS_ROOT" = true ]; then
        install_system_deps
    else
        log_info "Installing system dependencies (may prompt for sudo)..."
        sudo bash -c "$(declare -f install_system_deps); DISTRO='$DISTRO'; install_system_deps"
    fi
    
    # Check and install Node.js
    if ! command -v node &> /dev/null; then
        log_info "Node.js not found. Installing..."
        if [ "$RUNNING_AS_ROOT" = true ]; then
            install_nodejs
        else
            sudo bash -c "$(declare -f install_nodejs detect_distro); DISTRO='$DISTRO'; install_nodejs"
        fi
    else
        NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 18 ]; then
            log_warning "Node.js version is too old ($NODE_VERSION). Upgrading..."
            if [ "$RUNNING_AS_ROOT" = true ]; then
                install_nodejs
            else
                sudo bash -c "$(declare -f install_nodejs detect_distro); DISTRO='$DISTRO'; install_nodejs"
            fi
        else
            log_success "Node.js found: $(node --version)"
        fi
    fi
    
    # Check and install Rust
    export PATH="$ACTUAL_HOME/.cargo/bin:$PATH"
    if ! command -v cargo &> /dev/null; then
        log_info "Rust not found. Installing..."
        install_rust
    else
        log_success "Rust found: $(rustc --version)"
    fi
    
    # Build the application
    build_app
    
    # Install the package
    install_deb
    
    # Success message
    echo ""
    echo "========================================="
    log_success "Installation complete!"
    echo "========================================="
    echo ""
    echo "Today's Command has been installed successfully!"
    echo ""
    echo "You can now:"
    echo "  • Launch from your applications menu"
    echo "  • Run: todays-command"
    echo "  • Click the system tray icon to show/hide"
    echo ""
    echo "Need help? Visit: https://github.com/anomalyco/todays-command/issues"
    echo ""
}

# Run main function
main "$@"
