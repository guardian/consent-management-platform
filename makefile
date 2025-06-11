.PHONY: help clean
.PHONY: synthetics-install synthetics-test synthetics-test-dev synthetics-lint
.PHONY: synthetics-build synthetics-start synthetics-clean synthetics-update
.PHONY: synthetics-start-debug
.PHONY: cdk-install cdk-build cdk-watch cdk-test cdk-test-dev cdk-format cdk-lint cdk-synth cdk-diff cdk-clean cdk-update
# Makefile for managing synthetics and CDK projects
# This Makefile provides a set of commands to manage the synthetics and CDK projects
# including installation, testing, linting, building, and cleaning.
# It also includes commands for updating dependencies and running the projects in development mode.
# Usage:
#   make <target>
# Targets:
#   synthetics-install: Install dependencies for the synthetics project
#   synthetics-test: Run tests for the synthetics project
#   synthetics-test-dev: Run tests for the synthetics project in watch mode
#   synthetics-lint: Run linting for the synthetics project
#   synthetics-build: Build the synthetics project
#   synthetics-start: Run the synthetics project locally
#   synthetics-start-debug: Run the synthetics project locally in debug mode
#   synthetics-clean: Clean the synthetics project artifacts
#   synthetics-update: Update dependencies for the synthetics project
#   cdk-install: Install dependencies for the CDK project
#   cdk-build: Build the CDK project
#   cdk-watch: Build the CDK project in watch mode
#   cdk-test: Run tests for the CDK project
#   cdk-test-dev: Run tests for the CDK project in watch mode
#   cdk-format: Format the CDK code
#   cdk-lint: Run linting for the CDK project
#   cdk-synth: Synthesize the CDK stack
#   cdk-diff: Show the CDK diff
#   cdk-clean: Clean the CDK project artifacts
#   cdk-update: Update dependencies for the CDK project
#   clean: Clean all artifacts from both projects
#   update: Update all dependencies for both projects
#   help: Show this help message

# Configuration
export PATH := node_modules/.bin:$(PATH)
export SHELL := /usr/bin/env bash

# Default target
help:
	@echo "make synthetics-install"
	@echo "make synthetics-test"
	@echo "make synthetics-test-dev"
	@echo "make synthetics-lint"
	@echo "make synthetics-build"
	@echo "make synthetics-start"
	@echo "make synthetics-start-debug"
	@echo "make synthetics-clean"
	@echo "make synthetics-update"
	@echo "make cdk-install"
	@echo "make cdk-build"
	@echo "make cdk-watch"
	@echo "make cdk-test"
	@echo "make cdk-test-dev"
	@echo "make cdk-format"
	@echo "make cdk-lint"
	@echo "make cdk-synth"
	@echo "make cdk-diff"
	@echo "make cdk-clean"
	@echo "make cdk-update"
	@echo "make clean"

define log
		@node scripts/log $(1)
endef

# Synthetics targets
synthetics-install:
	$(call log, "Installing synthetics dependencies...")
	cd synthetics && pnpm test
	cd synthetics && pnpm install

synthetics-test:
	$(call log, "Running synthetics tests...")
	cd synthetics && pnpm test

synthetics-test-dev:
	$(call log, "Running synthetics tests in watch mode...")
	cd synthetics && pnpm run test:dev

synthetics-lint:
	$(call log, " Running synthetics lint....")
	cd synthetics && pnpm run lint

synthetics-build:
	$(call log, "Building synthetics project...")
	cd synthetics && pnpm run build

synthetics-start:
	$(call log, "Run synthetics locally...")
	cd synthetics && pnpm start

synthetics-start-debug:
	$(call log, "Run synthetics locally...")
	cd synthetics && DEBUG_MODE=true pnpm start

synthetics-clean:
	$(call log, "Cleaning synthetics...")
	cd synthetics && rm -rf node_modules dist coverage
synthetics-update:
	$(call log, "Updating synthetics dependencies...")
	cd synthetics && pnpm update -L -i



# CDK targets
cdk-install:
	$(call log, "Installing CDK dependencies...")
	cd cdk && pnpm install

cdk-build:
	$(call log, "Building CDK project...")
	cd cdk && pnpm run build

cdk-watch:
	$(call log, "Building CDK project in watch mode...")
	cd cdk && pnpm run watch

cdk-test:
	$(call log, "Running CDK tests...")
	cd cdk && pnpm test

cdk-test-dev:
	$(call log, "Running CDK tests in watch mode...")
	cd cdk && pnpm run test:dev

cdk-format:
	$(call log, "Formatting CDK code...")
	cd cdk && pnpm run format

cdk-lint:
	$(call log, "Running CDK lint...")
	cd cdk && pnpm run lint

cdk-synth:
	$(call log, "Synthesizing CDK stack...")
	cd cdk && pnpm run synth

cdk-diff:
	$(call log, "Showing CDK diff...")
	cd cdk && pnpm run diff

cdk-update:
	$(call log, "Updating cdk dependencies...")
	cd cdk && pnpm update -L -i

# Clean CDK artifacts
cdk-clean:
	$(call log, "Cleaning CDK...")
	cd cdk && rm -rf node_modules dist coverage cdk.out

clean: synthetics-clean cdk-clean
	$(call log, "Cleaning all artifacts...")

update: synthetics-update cdk-update
	$(call log, "Updating all dependencies...")
	$(call log, "All dependencies updated successfully.")
