#!/bin/bash
# Vector Analysis Tools Installer
# This script installs tools needed for better vector file analysis

echo "Installing vector analysis tools..."

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
elif type lsb_release >/dev/null 2>&1; then
    OS=$(lsb_release -si)
else
    OS=$(uname -s)
fi

echo "Detected OS: $OS"

# Install based on OS
if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    echo "Installing tools for Ubuntu/Debian..."
    sudo apt-get update
    sudo apt-get install -y pdftk poppler-utils inkscape pdf2svg pstoedit librsvg2-bin
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Fedora"* ]]; then
    echo "Installing tools for CentOS/RHEL/Fedora..."
    sudo yum install -y pdftk poppler-utils inkscape pdf2svg pstoedit librsvg2
elif [[ "$OS" == *"Alpine"* ]]; then
    echo "Installing tools for Alpine..."
    apk add --no-cache pdftk poppler-utils inkscape pdf2svg pstoedit librsvg
elif [[ "$OS" == *"macOS"* ]] || [[ "$OS" == *"Darwin"* ]]; then
    echo "Installing tools for macOS..."
    brew install pdftk-java poppler inkscape pdf2svg pstoedit librsvg
else
    echo "Unsupported OS for automatic installation"
    echo "Please manually install: pdftk, poppler-utils, inkscape, pdf2svg, pstoedit, librsvg"
    exit 1
fi

echo "Installation complete!"
echo "You can now analyze vector files with better results."