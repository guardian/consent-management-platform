# Workflow Directory

This folder consists of the workflow/action files for continuous integration and deployment in Github Action.

Below are 4 workflows that are triggered by specific actions i.e pushing to a branch, scheduled trigger

1. [`cmp-ci.yml`](cmp-ci.yml)

-   Trigger: Pushing to a branch
-   Description: Initiates a sequence of sub-workflows/workflow_calls ([`cmp-run-tests.yml`](cmp-run-tests.yml), [`cmp-run-checks.yml`](cmp-run-checks.yml), and [`cmp-build.yml`](cmp-build.yml)) associated with the CMP app.

2. [`cmp-beta-release-on-label.yml`](cmp-beta-release-on-label.yml)

-   Trigger: Adding a label to pull requests.
-   Description: Initiates a sequence of sub-workflows/workflow_calls ([`cmp-run-tests.yml`](cmp-run-tests.yml) and [`cmp-build.yml`](cmp-build.yml)) associated with the CMP app.

3. [`monitoring-ci.yml`](monitoring-ci.yml)

-   Trigger: Pushing to a branch
-   Description: Initiates a series of jobs related to the `cdk` and `monitoring` app. This includes running tests and checks within the `cdk` and `monitoring` directories.

4. [`daily-test.yml`](daily-test.yml)

-   Trigger: Cron scheduler
-   Description: This runs a test `yarn test:vendor-list` to check the vendor list is up to date.
