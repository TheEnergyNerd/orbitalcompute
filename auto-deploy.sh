#!/bin/bash

set -e  # Exit on error

echo "🚀 Automated Deployment Setup for Orbital Compute Simulator"
echo "============================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check Git status
echo "📦 Checking Git repository..."
if [ ! -d .git ]; then
    echo -e "${RED}❌ Not a git repository. Initializing...${NC}"
    git init
    git add .
    git commit -m "Initial commit: Orbital Compute Simulator"
fi

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Uncommitted changes detected. Committing...${NC}"
    git add -A
    git commit -m "Update: Prepare for deployment"
fi

# Step 2: GitHub Setup
echo ""
echo "🐙 Setting up GitHub repository..."

# Check if GitHub CLI is available
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI not found. Please install: brew install gh${NC}"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated with GitHub. Please run: gh auth login${NC}"
    echo "   Then run this script again."
    exit 1
fi

# Get current directory name as default repo name
REPO_NAME=$(basename "$(pwd)")

# Check if remote already exists
if git remote get-url origin &> /dev/null; then
    echo -e "${GREEN}✅ Git remote 'origin' already configured${NC}"
    REMOTE_URL=$(git remote get-url origin)
    echo "   Remote: $REMOTE_URL"
else
    # Create GitHub repository
    echo "Creating GitHub repository: $REPO_NAME"
    
    # Check if repo already exists
    if gh repo view "$REPO_NAME" &> /dev/null; then
        echo -e "${YELLOW}⚠️  Repository '$REPO_NAME' already exists on GitHub${NC}"
        read -p "Use existing repository? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            read -p "Enter repository name: " REPO_NAME
        fi
    else
        # Create new repository
        echo "Creating new repository: $REPO_NAME"
        gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
        echo -e "${GREEN}✅ Repository created and pushed to GitHub${NC}"
    fi
fi

# Rename branch to main if needed
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "📝 Renaming branch to 'main'..."
    git branch -M main
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
if git push -u origin main 2>&1; then
    echo -e "${GREEN}✅ Successfully pushed to GitHub${NC}"
else
    echo -e "${YELLOW}⚠️  Push failed or already up to date${NC}"
fi

# Get repository URL
REPO_URL=$(gh repo view --json url -q .url 2>/dev/null || git remote get-url origin)
echo ""
echo -e "${GREEN}Repository URL: $REPO_URL${NC}"

# Step 3: Railway Setup
echo ""
echo "🚂 Setting up Railway deployment..."

if command -v railway &> /dev/null; then
    # Check if logged in
    if railway whoami &> /dev/null; then
        echo -e "${GREEN}✅ Authenticated with Railway${NC}"
        
        # Check if already linked
        if [ -f .railway/project.json ]; then
            echo -e "${GREEN}✅ Project already linked to Railway${NC}"
        else
            echo "Linking project to Railway..."
            railway link
        fi
        
        echo "Deploying to Railway..."
        railway up
        echo -e "${GREEN}✅ Railway deployment initiated${NC}"
        
        # Get Railway URL
        RAILWAY_URL=$(railway domain 2>/dev/null || echo "Check Railway dashboard for URL")
        echo -e "${GREEN}Railway URL: $RAILWAY_URL${NC}"
    else
        echo -e "${YELLOW}⚠️  Not authenticated with Railway${NC}"
        echo "   Please run: railway login"
        echo "   Then run: railway link"
        echo "   Then run: railway up"
    fi
else
    echo -e "${YELLOW}⚠️  Railway CLI not found${NC}"
    echo "   Install: npm i -g @railway/cli"
    echo "   Or deploy via Railway dashboard: https://railway.app"
fi

# Step 4: Vercel Setup
echo ""
echo "▲ Setting up Vercel deployment..."

if command -v vercel &> /dev/null; then
    echo "Deploying to Vercel..."
    cd frontend
    
    # Check if already linked
    if [ -f .vercel/project.json ]; then
        echo -e "${GREEN}✅ Project already linked to Vercel${NC}"
    else
        echo "Linking project to Vercel..."
        vercel link
    fi
    
    # Deploy
    vercel --prod
    echo -e "${GREEN}✅ Vercel deployment initiated${NC}"
    cd ..
else
    echo -e "${YELLOW}⚠️  Vercel CLI not found${NC}"
    echo "   Install: npm i -g vercel"
    echo "   Or deploy via Vercel dashboard: https://vercel.com"
    echo ""
    echo "   Manual steps:"
    echo "   1. Go to https://vercel.com"
    echo "   2. Import your GitHub repository"
    echo "   3. Set Root Directory: frontend"
    echo "   4. Add environment variables:"
    echo "      - NEXT_PUBLIC_CESIUM_ION_TOKEN"
    echo "      - NEXT_PUBLIC_API_BASE (your Railway URL)"
fi

# Step 5: Summary
echo ""
echo "============================================================"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Get Cesium Ion token: https://cesium.com/ion/"
echo "2. Add to Vercel environment variables:"
echo "   - NEXT_PUBLIC_CESIUM_ION_TOKEN"
echo "   - NEXT_PUBLIC_API_BASE (your Railway URL)"
echo ""
echo "Repository: $REPO_URL"
echo ""

