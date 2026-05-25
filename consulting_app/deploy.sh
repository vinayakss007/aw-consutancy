#!/bin/bash
# Deployment script for Business Consulting Toolkit
# This script copies the application files to a deployment directory

SOURCE_DIR="./"
DEPLOY_DIR="./deployment"

echo "Creating deployment directory..."
mkdir -p "$DEPLOY_DIR"

echo "Copying files to deployment directory..."
cp -r index.html app.js forms.js reports.js storage.js styles.css manifest.json service-worker.js excel-importer.js template-system.js README.md "$DEPLOY_DIR"/

echo "Deployment ready in $DEPLOY_DIR folder"
echo "To host locally, run: python -m http.server 8000 -d $DEPLOY_DIR"
echo "Or with Node.js: npx http-server $DEPLOY_DIR"