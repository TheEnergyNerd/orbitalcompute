#!/bin/bash

# Script to set up GitHub repository and push code

echo "🚀 Setting up GitHub repository for Orbital Compute Simulator"
echo ""

# Check if git remote already exists
if git remote get-url origin &> /dev/null; then
    echo "⚠️  Git remote 'origin' already exists:"
    git remote get-url origin
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your GitHub repository URL (e.g., https://github.com/username/orbitalcompute.git): " REPO_URL
        git remote set-url origin "$REPO_URL"
    fi
else
    read -p "Enter your GitHub repository URL (e.g., https://github.com/username/orbitalcompute.git): " REPO_URL
    git remote add origin "$REPO_URL"
fi

# Rename branch to main if needed
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "📝 Renaming branch from '$CURRENT_BRANCH' to 'main'..."
    git branch -M main
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "Next steps:"
    echo "1. Deploy backend to Railway: https://railway.app"
    echo "2. Deploy frontend to Vercel: https://vercel.com"
    echo "3. See DEPLOYMENT.md for detailed instructions"
else
    echo ""
    echo "❌ Failed to push to GitHub. Please check:"
    echo "   - Your GitHub repository exists"
    echo "   - You have push access"
    echo "   - Your GitHub credentials are configured"
fi

