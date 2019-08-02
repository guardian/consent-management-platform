#!/bin/bash -xe

set -e

# Installing yarn

YARN_VERSION="1.7.0"
YARN_LOCATION="$(pwd)/tools/${YARN_VERSION}"

if [ ! -d "$YARN_LOCATION" ]; then
	mkdir -p ${YARN_LOCATION}
	cd ${YARN_LOCATION}/
	wget -qO- https://github.com/yarnpkg/yarn/releases/download/v${YARN_VERSION}/yarn-v${YARN_VERSION}.tar.gz | tar zvx
	cd ../..
fi

export PATH="$PATH:$YARN_LOCATION/yarn-v$YARN_VERSION/bin"

yarn -h

# Install dependencies
# npm install --save-dev yarn
# yarn

# Validate src
# yarn validate
# yarn test
