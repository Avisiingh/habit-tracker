#!/bin/bash

# Install Node.js dependencies
npm install

# Create necessary directories
mkdir -p src/components
mkdir -p src/lib
mkdir -p src/types

# Initialize git repository if not already initialized
if [ ! -d .git ]; then
  git init
  git add .
  git commit -m "Initial commit"
fi

# Create .gitignore file
echo "node_modules
.next
.env
.env.local
.DS_Store" > .gitignore

echo "Project initialized successfully! Run 'npm run dev' to start the development server." 