#!/bin/bash

NPM_PACKAGE="package.npm.json"
GITHUB_PACKAGE="package.github.json"
MAIN_PACKAGE="package.json"

# Function to bump the version
bump_version() {
  NEW_VERSION=$(npm version $1 --git-tag-version false)
  
  # Update the version in the minimal package files as well
  jq --arg version "$NEW_VERSION" '.version = $version' $NPM_PACKAGE > temp_npm.json && mv temp_npm.json $NPM_PACKAGE
  jq --arg version "$NEW_VERSION" '.version = $version' $GITHUB_PACKAGE > temp_github.json && mv temp_github.json $GITHUB_PACKAGE
  
  jq --arg version "$NEW_VERSION" '.version = $version' $MAIN_PACKAGE > temp.json && mv temp.json $MAIN_PACKAGE
}

# Bump version if provided
if [ -n "$2" ]; then
  bump_version $2
fi

# Backup the original package.json
cp $MAIN_PACKAGE package.backup.json

if [ "$1" == "npm" ]; then
  # Replace name and version in package.json with those from package.npm.json
  jq '.name = $name | .version = $version' --argjson name "$(jq '.name' $NPM_PACKAGE)" --argjson version "$(jq '.version' $NPM_PACKAGE)" $MAIN_PACKAGE > temp.json && mv temp.json $MAIN_PACKAGE

  echo "Publishing to npm..."
  npm publish

  # Commit and push the correct package.json
  git add $MAIN_PACKAGE
  git commit -m "Release version $(jq -r .version $MAIN_PACKAGE) for npm"
  git push --follow-tags

elif [ "$1" == "github" ]; then
  # Replace name and version in package.json with those from package.github.json
  jq '.name = $name | .version = $version' --argjson name "$(jq '.name' $GITHUB_PACKAGE)" --argjson version "$(jq '.version' $GITHUB_PACKAGE)" $MAIN_PACKAGE > temp.json && mv temp.json $MAIN_PACKAGE

  echo "Publishing to GitHub Packages..."
  npm publish --registry=https://npm.pkg.github.com

  # Commit and push the correct package.json
  git add $MAIN_PACKAGE
  git commit -m "Release version $(jq -r .version $MAIN_PACKAGE) for GitHub Packages"
  git push --follow-tags

else
  echo "Usage: ./publish.sh [npm|github] [version]"
  exit 1
fi

# Restore the original package.json
mv package.backup.json $MAIN_PACKAGE