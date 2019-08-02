#!/bin/bash -xe

# Install dependencies
yarn

# Validate src
yarn validate
yarn test
