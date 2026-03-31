#!/bin/bash
# Quick Start Installation Script
# Virtual Internship & Certificate Generator App

echo "🎓 Virtual Internship & Certificate Generator App"
echo "=================================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not installed. Please install from https://nodejs.org/"
    exit 1
else
    echo "✅ Node.js $(node --version) installed"
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not installed"
    exit 1
else
    echo "✅ npm $(npm --version) installed"
fi

# Install firebase-tools
echo ""
echo "📦 Installing Firebase Tools..."
npm install -g firebase-tools

# Check firebase installation
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI installation failed"
    exit 1
else
    echo "✅ Firebase CLI $(firebase --version | head -1) installed"
fi

# Install project dependencies
echo ""
echo "📦 Installing project dependencies..."
npm install

echo ""
echo "✅ Installation Complete!"
echo ""
echo "🚀 Next Steps:"
echo "1. Read documentation/SETUP.md for Firebase configuration"
echo "2. Update config/firebase-config.js with your Firebase credentials"
echo "3. Run: firebase serve (to test locally)"
echo "4. Run: firebase deploy (to deploy to production)"
echo ""
echo "📚 Documentation:"
echo "- Setup Guide: documentation/SETUP.md"
echo "- Features: documentation/FEATURES.md"
echo "- Deployment: documentation/DEPLOYMENT.md"
echo "- API Reference: documentation/API-DOCS.md"
echo ""
echo "Happy certificate generating! 🎓"
