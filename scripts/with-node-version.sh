#!/bin/bash

# Script to run commands with the correct Node version
# Usage: ./scripts/with-node-version.sh <directory> <command>

set -e

DIRECTORY="$1"
shift
COMMAND="$*"

if [ -z "$DIRECTORY" ] || [ -z "$COMMAND" ]; then
    echo "Usage: $0 <directory> <command>"
    exit 1
fi

cd "$DIRECTORY"

# Always use .nvmrc from the repo root
if [ -f "../.nvmrc" ]; then
    NODE_VERSION=$(cat "../.nvmrc")
    # Try fnm first
    if command -v fnm >/dev/null 2>&1; then
        eval "$(fnm env --use-on-cd)"
        fnm use "$NODE_VERSION"
        eval "$COMMAND"
    # Fall back to nvm
    elif command -v nvm >/dev/null 2>&1; then
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm use "$NODE_VERSION"
        eval "$COMMAND"
    else
        echo "Warning: No Node version manager found - using system Node."
        eval "$COMMAND"
    fi
else
    echo "No .nvmrc file found in repo root - using system Node."
    eval "$COMMAND"
fi
