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

# Check if .nvmrc exists
if [ -f ".nvmrc" ]; then
    # Try fnm first
    if command -v fnm >/dev/null 2>&1; then
        eval "$(fnm env --use-on-cd)"
        fnm use
        eval "$COMMAND"
    # Fall back to nvm
    elif command -v nvm >/dev/null 2>&1; then
        # Source nvm if it exists
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm use
        eval "$COMMAND"
    else
        echo "Warning: No Node version manager found. Using system Node."
        eval "$COMMAND"
    fi
else
    echo "No .nvmrc file found in $DIRECTORY, using system Node."
    eval "$COMMAND"
fi
