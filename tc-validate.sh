#!/bin/bash -xe

set -e

# Installing yarn

YARN_VERSION="1.17.3"
YARN_LOCATION="$(pwd)/tools/${YARN_VERSION}"

if [ ! -d "$YARN_LOCATION" ]; then
	mkdir -p ${YARN_LOCATION}
	cd ${YARN_LOCATION}/
	wget -qO- https://github.com/yarnpkg/yarn/releases/download/v${YARN_VERSION}/yarn-v${YARN_VERSION}.tar.gz | tar zvx
	cd ../..
fi

export PATH="$PATH:$YARN_LOCATION/yarn-v$YARN_VERSION/bin"

# Install dependencies
yarn install

# Validate and test
yarn validate
