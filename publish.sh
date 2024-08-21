#!/bin/bash

# Script to manage publishing to npm and GitHub Packages
# Usage: ./publish.sh [npm|github] [version]

# File names
NPM_PACKAGE="package.npm.json"
GITHUB_PACKAGE="package.github.json"
MAIN_PACKAGE="package.json"

# Function to synchronize dependencies, scripts, and version between npm and GitHub package.json
sync_package_json() {
  jq -s '.[0] * .[1]' $MAIN_PACKAGE $1 > $2
}

# Function to bump the version
bump_version() {
  NEW_VERSION=$(npm version $1 --git-tag-version false)
  jq --arg version "$NEW_VERSION" '.version = $version' $MAIN_PACKAGE > temp.json && mv temp.json $MAIN_PACKAGE
}

# Function to synchronize version between the different package.json files
sync_version() {
  VERSION=$(jq -r .version $MAIN_PACKAGE)
  jq --arg version "$VERSION" '.version = $version' $NPM_PACKAGE > temp_npm.json && mv temp_npm.json $NPM_PACKAGE
  jq --arg version "$VERSION" '.version = $version' $GITHUB_PACKAGE > temp_github.json && mv temp_github.json $GITHUB_PACKAGE
}

# Bump version if provided
if [ -n "$2" ]; then
  bump_version $2
  sync_version
fi

# Check for the publishing target
if [ "$1" == "npm" ]; then
  # Sync the current main package.json with the npm one
  sync_package_json $NPM_PACKAGE $MAIN_PACKAGE

  echo "Publishing to npm..."
  npm publish

elif [ "$1" == "github" ]; then
  # Sync the current main package.json with the GitHub one
  sync_package_json $GITHUB_PACKAGE $MAIN_PACKAGE

  echo "Publishing to GitHub Packages..."
  npm publish --registry=https://npm.pkg.github.com

else
  echo "Usage: ./publish.sh [npm|github] [version]"
  exit 1
fi

# Push the changes and tags to Git
git add .
git commit -m "Release version $VERSION"
git push --follow-tags