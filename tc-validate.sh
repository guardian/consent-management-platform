#!/bin/bash -xe

# Install dependencies
nvm install --save-dev yarn
yarn

# Validate src
yarn validate
yarn test
