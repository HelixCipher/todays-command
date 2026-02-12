#!/bin/bash

# Today's Command - Complete Uninstaller
# This script removes all traces of the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
echo "Today's Command - Complete Uninstaller"
echo "========================================="
echo ""

# Get the actual user (even if running with sudo)
if [ "$SUDO_USER" ]; then
    ACTUAL_USER="$SUDO_USER"
    ACTUAL_HOME="$(getent passwd "$SUDO_USER" | cut -d: -f6)"
else
    ACTUAL_USER="$(whoami)"
    ACTUAL_HOME="$HOME"
fi

log_info "Uninstalling for user: $ACTUAL_USER"
echo ""

# Paths
INSTALL_DIR="$ACTUAL_HOME/.local/share/todays-command"
BIN_DIR="$ACTUAL_HOME/.local/bin"
DESKTOP_DIR="$ACTUAL_HOME/.local/share/applications"
ICON_DIR="$ACTUAL_HOME/.local/share/icons/hicolor/128x128/apps"
APP_DATA_DIR="$ACTUAL_HOME/.config/todays-command"
CACHE_DIR="$ACTUAL_HOME/.cache/todays-command"
AUTOSTART_DIR="$ACTUAL_HOME/.config/autostart"

# Track what was found and removed
FOUND_SYSTEM_PKG=false
FOUND_LOCAL_INSTALL=false
FOUND_USER_DATA=false

# Diagnostic function to help debug installation location
diagnose_installation() {
    log_info "Running diagnostics to find installation..."
    
    # Check where the binary is
    if command -v todays-command &> /dev/null; then
        BINARY_PATH=$(command -v todays-command)
        log_info "Found binary at: $BINARY_PATH"
        
        # Try to find the package that owns this file
        if command -v dpkg &> /dev/null; then
            PKG_OWNER=$(dpkg -S "$BINARY_PATH" 2>/dev/null | cut -d: -f1)
            if [ -n "$PKG_OWNER" ]; then
                log_info "Binary owned by package: $PKG_OWNER"
                FOUND_SYSTEM_PKG=true
                
                if [ "$RUNNING_AS_ROOT" = true ]; then
                    dpkg -r "$PKG_OWNER" 2>/dev/null || true
                    apt-get autoremove -y 2>/dev/null || true
                else
                    sudo dpkg -r "$PKG_OWNER" 2>/dev/null || true
                    sudo apt-get autoremove -y 2>/dev/null || true
                fi
                log_success "Removed package: $PKG_OWNER"
            fi
        elif command -v rpm &> /dev/null; then
            PKG_OWNER=$(rpm -qf "$BINARY_PATH" 2>/dev/null)
            if [ -n "$PKG_OWNER" ]; then
                log_info "Binary owned by package: $PKG_OWNER"
                FOUND_SYSTEM_PKG=true
                
                if [ "$RUNNING_AS_ROOT" = true ]; then
                    rpm -e "$PKG_OWNER" 2>/dev/null || true
                else
                    sudo rpm -e "$PKG_OWNER" 2>/dev/null || true
                fi
                log_success "Removed package: $PKG_OWNER"
            fi
        fi
        
        # If we couldn't find a package, at least remove the binary
        if [ "$FOUND_SYSTEM_PKG" = false ]; then
            log_warning "Could not determine package - removing binary directly"
            if [ "$RUNNING_AS_ROOT" = true ]; then
                rm -f "$BINARY_PATH"
            else
                sudo rm -f "$BINARY_PATH"
            fi
            FOUND_SYSTEM_PKG=true
            log_success "Removed binary: $BINARY_PATH"
        fi
    else
        log_info "Binary 'todays-command' not found in PATH"
    fi
    
    # Check for any todays-command processes
    if pgrep -f "todays-command" > /dev/null 2>&1; then
        log_info "Process 'todays-command' is still running"
        pkill -9 -f "todays-command" 2>/dev/null || true
        log_success "Killed remaining processes"
    fi
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    RUNNING_AS_ROOT=true
    log_warning "Running as root - will attempt to remove system-wide installation"
else
    RUNNING_AS_ROOT=false
fi

# Function to kill running processes
kill_processes() {
    log_info "Stopping any running instances..."
    
    # Kill main process
    if pgrep -x "todays-command" > /dev/null 2>&1; then
        pkill -x "todays-command" 2>/dev/null || true
        sleep 1
        # Force kill if still running
        if pgrep -x "todays-command" > /dev/null 2>&1; then
            pkill -9 -x "todays-command" 2>/dev/null || true
        fi
        log_success "Stopped running processes"
    fi
    
    # Kill any tray/icon processes
    if pgrep -f "todays-command" > /dev/null 2>&1; then
        pkill -f "todays-command" 2>/dev/null || true
        sleep 1
    fi
}

# Remove system-wide package installation
remove_system_package() {
    log_info "Checking for system-wide package installation..."
    
    # Check if installed via dpkg/apt - try various package name patterns
    if command -v dpkg &> /dev/null; then
        # Try to find the package with various possible names
        PKG_NAME=$(dpkg -l 2>/dev/null | grep -i "todays.command\|todayscommand\|todays-command" | awk '{print $2}' | head -1)
        
        if [ -n "$PKG_NAME" ]; then
            FOUND_SYSTEM_PKG=true
            log_info "Found system package: $PKG_NAME"
            
            if [ "$RUNNING_AS_ROOT" = true ]; then
                log_info "Removing package $PKG_NAME..."
                dpkg -r "$PKG_NAME" 2>/dev/null || true
                apt-get autoremove -y 2>/dev/null || true
            else
                log_info "Removing package $PKG_NAME (requires sudo)..."
                sudo dpkg -r "$PKG_NAME" 2>/dev/null || true
                sudo apt-get autoremove -y 2>/dev/null || true
            fi
            
            log_success "System package removed"
        fi
    fi
    
    # Check for rpm installation
    if command -v rpm &> /dev/null; then
        PKG_NAME=$(rpm -qa 2>/dev/null | grep -i "todays.command\|todayscommand\|todays-command" | head -1)
        
        if [ -n "$PKG_NAME" ]; then
            FOUND_SYSTEM_PKG=true
            log_info "Found RPM package: $PKG_NAME"
            
            if [ "$RUNNING_AS_ROOT" = true ]; then
                rpm -e "$PKG_NAME" 2>/dev/null || true
            else
                sudo rpm -e "$PKG_NAME" 2>/dev/null || true
            fi
            
            log_success "RPM package removed"
        fi
    fi
    
    # Check for binary in common system locations
    SYSTEM_BIN_PATHS=("/usr/bin/todays-command" "/usr/local/bin/todays-command" "/usr/local/bin/Todays-Command")
    for BIN_PATH in "${SYSTEM_BIN_PATHS[@]}"; do
        if [ -f "$BIN_PATH" ]; then
            FOUND_SYSTEM_PKG=true
            log_info "Found binary at: $BIN_PATH"
            
            if [ "$RUNNING_AS_ROOT" = true ]; then
                rm -f "$BIN_PATH"
            else
                sudo rm -f "$BIN_PATH"
            fi
            log_success "Removed binary: $BIN_PATH"
        fi
    done
    
    # Check /opt installation
    if [ -d "/opt/todays-command" ] || [ -d "/opt/Todays-Command" ]; then
        FOUND_SYSTEM_PKG=true
        log_info "Found /opt installation"
        
        if [ "$RUNNING_AS_ROOT" = true ]; then
            rm -rf /opt/todays-command /opt/Todays-Command
        else
            sudo rm -rf /opt/todays-command /opt/Todays-Command
        fi
        
        log_success "/opt installation removed"
    fi
    
    # Remove system desktop entries (check various naming patterns)
    DESKTOP_PATHS=(
        "/usr/share/applications/todays-command.desktop"
        "/usr/share/applications/todayscommand.desktop"
        "/usr/local/share/applications/todays-command.desktop"
        "/usr/local/share/applications/todayscommand.desktop"
        "/usr/share/applications/Todays-Command.desktop"
    )
    
    for DESKTOP_PATH in "${DESKTOP_PATHS[@]}"; do
        if [ -f "$DESKTOP_PATH" ]; then
            FOUND_SYSTEM_PKG=true
            log_info "Found desktop entry: $DESKTOP_PATH"
            
            if [ "$RUNNING_AS_ROOT" = true ]; then
                rm -f "$DESKTOP_PATH"
            else
                sudo rm -f "$DESKTOP_PATH"
            fi
            log_success "Removed desktop entry: $DESKTOP_PATH"
        fi
    done
    
    # Remove system icons
    ICON_PATHS=(
        "/usr/share/icons/hicolor/128x128/apps/todays-command.png"
        "/usr/share/pixmaps/todays-command.png"
        "/usr/local/share/icons/todays-command.png"
    )
    
    for ICON_PATH in "${ICON_PATHS[@]}"; do
        if [ -f "$ICON_PATH" ]; then
            FOUND_SYSTEM_PKG=true
            if [ "$RUNNING_AS_ROOT" = true ]; then
                rm -f "$ICON_PATH"
            else
                sudo rm -f "$ICON_PATH"
            fi
        fi
    done
    
    # Update system desktop database if we removed desktop entries
    if [ "$FOUND_SYSTEM_PKG" = true ]; then
        if command -v update-desktop-database &> /dev/null; then
            if [ "$RUNNING_AS_ROOT" = true ]; then
                update-desktop-database /usr/share/applications 2>/dev/null || true
            else
                sudo update-desktop-database /usr/share/applications 2>/dev/null || true
            fi
        fi
    fi
    
    # If still not found but binary exists, run diagnostics
    if [ "$FOUND_SYSTEM_PKG" = false ] && command -v todays-command &> /dev/null; then
        log_warning "Standard checks didn't find installation, but binary exists"
        diagnose_installation
    fi
}

# Remove user-local installation
remove_local_install() {
    log_info "Checking for user-local installation..."
    
    # Check if local binary exists
    if [ -f "$BIN_DIR/todays-command" ] || [ -f "$INSTALL_DIR/todays-command" ]; then
        FOUND_LOCAL_INSTALL=true
        log_info "Found user-local installation"
        
        # Remove binary wrapper
        if [ -f "$BIN_DIR/todays-command" ]; then
            rm -f "$BIN_DIR/todays-command"
            log_success "Removed binary from $BIN_DIR"
        fi
        
        # Remove installation directory
        if [ -d "$INSTALL_DIR" ]; then
            rm -rf "$INSTALL_DIR"
            log_success "Removed installation directory: $INSTALL_DIR"
        fi
        
        # Remove desktop entry
        if [ -f "$DESKTOP_DIR/todays-command.desktop" ]; then
            rm -f "$DESKTOP_DIR/todays-command.desktop"
            log_success "Removed desktop entry"
        fi
        
        # Remove icon
        if [ -f "$ICON_DIR/todays-command.png" ]; then
            rm -f "$ICON_DIR/todays-command.png"
            log_success "Removed icon"
        fi
        
        # Update desktop database
        if command -v update-desktop-database &> /dev/null; then
            update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
        fi
    fi
}

# Remove user data and configuration
remove_user_data() {
    log_info "Checking for user data and configuration..."
    
    # App data directory (config, settings, streaks, etc.)
    if [ -d "$APP_DATA_DIR" ]; then
        FOUND_USER_DATA=true
        log_info "Found app data at: $APP_DATA_DIR"
        rm -rf "$APP_DATA_DIR"
        log_success "Removed app data"
    fi
    
    # Cache directory
    if [ -d "$CACHE_DIR" ]; then
        FOUND_USER_DATA=true
        rm -rf "$CACHE_DIR"
        log_success "Removed cache directory"
    fi
    
    # Autostart entry
    if [ -f "$AUTOSTART_DIR/todays-command.desktop" ]; then
        FOUND_USER_DATA=true
        rm -f "$AUTOSTART_DIR/todays-command.desktop"
        log_success "Removed autostart entry"
    fi
    
    # Legacy: Check for .var directory (Flatpak-style path)
    FLATPAK_DIR="$ACTUAL_HOME/.var/app/com.todayscommand.app"
    if [ -d "$FLATPAK_DIR" ]; then
        FOUND_USER_DATA=true
        rm -rf "$FLATPAK_DIR"
        log_success "Removed Flatpak-style data directory"
    fi
    
    # Remove any remaining Tauri-related data
    TAURI_DATA_DIR="$ACTUAL_HOME/.local/share/Tauri/todays-command"
    if [ -d "$TAURI_DATA_DIR" ]; then
        FOUND_USER_DATA=true
        rm -rf "$TAURI_DATA_DIR"
        log_success "Removed Tauri data directory"
    fi
}

# Clean up PATH if we added it
cleanup_path() {
    if [ -f "$ACTUAL_HOME/.bashrc" ]; then
        if grep -q "# Today's Command PATH addition" "$ACTUAL_HOME/.bashrc" 2>/dev/null || \
           grep -q "\.local/bin.*todays-command" "$ACTUAL_HOME/.bashrc" 2>/dev/null; then
            log_info "Cleaning up PATH in .bashrc..."
            # Remove the line we added
            sed -i '/# Today'\''s Command PATH addition/d' "$ACTUAL_HOME/.bashrc"
            sed -i '/\.local\/bin.*todays-command/d' "$ACTUAL_HOME/.bashrc"
            log_success "Cleaned up .bashrc"
        fi
    fi
    
    # Also check .zshrc
    if [ -f "$ACTUAL_HOME/.zshrc" ]; then
        if grep -q "# Today's Command PATH addition" "$ACTUAL_HOME/.zshrc" 2>/dev/null || \
           grep -q "\.local/bin.*todays-command" "$ACTUAL_HOME/.zshrc" 2>/dev/null; then
            log_info "Cleaning up PATH in .zshrc..."
            sed -i '/# Today'\''s Command PATH addition/d' "$ACTUAL_HOME/.zshrc"
            sed -i '/\.local\/bin.*todays-command/d' "$ACTUAL_HOME/.zshrc"
            log_success "Cleaned up .zshrc"
        fi
    fi
}

# Check for and offer to remove build artifacts
remove_build_artifacts() {
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    if [ -d "$SCRIPT_DIR/src-tauri/target" ] || [ -d "$SCRIPT_DIR/node_modules" ]; then
        log_info "Build artifacts found in source directory"
        read -p "Remove build artifacts (target/, node_modules/, dist/) from source directory? [y/N] " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf "$SCRIPT_DIR/src-tauri/target"
            rm -rf "$SCRIPT_DIR/node_modules"
            rm -rf "$SCRIPT_DIR/dist"
            log_success "Build artifacts removed"
        else
            log_info "Build artifacts kept"
        fi
    fi
}

# Summary
show_summary() {
    echo ""
    echo "========================================="
    log_success "Uninstallation Complete!"
    echo "========================================="
    echo ""
    
    if [ "$FOUND_SYSTEM_PKG" = true ]; then
        echo "✓ System-wide package removed"
    fi
    
    if [ "$FOUND_LOCAL_INSTALL" = true ]; then
        echo "✓ User-local installation removed"
    fi
    
    if [ "$FOUND_USER_DATA" = true ]; then
        echo "✓ User data and configuration removed"
    fi
    
    if [ "$FOUND_SYSTEM_PKG" = false ] && [ "$FOUND_LOCAL_INSTALL" = false ] && [ "$FOUND_USER_DATA" = false ]; then
        log_warning "No Today's Command installation was found"
        echo "   The app may have already been uninstalled or was never installed."
    else
        echo ""
        echo "All traces of Today's Command have been removed from your system."
        echo ""
        echo "Note: You may need to restart your terminal or log out/in for"
        echo "      PATH changes to take effect."
    fi
    
    echo ""
    echo "Thank you for trying Today's Command!"
    echo ""
}

# Main uninstallation flow
main() {
    # Confirm uninstallation
    if [ "$1" != "--yes" ] && [ "$1" != "-y" ]; then
        echo "This will completely remove Today's Command and all associated data."
        echo "This action cannot be undone."
        echo ""
        read -p "Are you sure you want to uninstall? [y/N] " -n 1 -r
        echo
        
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Uninstallation cancelled"
            exit 0
        fi
    fi
    
    echo ""
    
    # Stop running processes first
    kill_processes
    
    # Remove system package
    remove_system_package
    
    # Remove local installation
    remove_local_install
    
    # Remove user data
    remove_user_data
    
    # Clean up PATH
    cleanup_path
    
    # Ask about build artifacts
    remove_build_artifacts
    
    # Show summary
    show_summary
}

# Show help
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    echo "Usage: ./uninstall.sh [OPTIONS]"
    echo ""
    echo "Remove Today's Command completely from your system."
    echo ""
    echo "Options:"
    echo "  -y, --yes    Skip confirmation prompt"
    echo "  -h, --help   Show this help message"
    echo ""
    echo "This script removes:"
    echo "  - System packages (.deb, .rpm, AppImage)"
    echo "  - User-local installations"
    echo "  - Configuration and data files"
    echo "  - Desktop entries and icons"
    echo "  - Autostart entries"
    echo ""
    echo "Run without options for interactive mode with confirmation."
    exit 0
fi

# Run main
main "$@"
