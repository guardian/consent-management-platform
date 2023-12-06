#!/usr/bin/env bash

set -e

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
ROOT_DIR="${DIR}/../.."
LAMBDA_REGIONS=("cmp-monitoring-lambda-eu-west-1" "cmp-monitoring-lambda-us-west-1" "cmp-monitoring-lambda-ap-southeast-2" "cmp-monitoring-lambda-ca-central-1")

get_abs_filename() {
  # $1 : relative filename
  echo "$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
}

for region in "${LAMBDA_REGIONS[@]}"
do
	src_file=$(find $ROOT_DIR/monitoring/dist/index.js) # Gets the index.js file generated in the monitoring/dist. Throws error if it doesn't exist
	absolute_src_file_path=$(get_abs_filename "$src_file") # Gets the absolute path of the index.js file
	absolute_src_directory=$(dirname "$absolute_src_file_path") # Gets the src directory name the absolute_src_file_path
	cd "${absolute_src_directory}" # Go to monitoring/dist folder
	zip -FSr "${ROOT_DIR}/cdk/dist/${region}.zip" "." # Zip the monitoring/dist folder into cdk/dist
done


