# Workflow Directory

This folder consists of the workflow/action files for continuous integration and deployment in Github Action.

Below are 4 workflows that are triggered by specific actions i.e pushing to a branch, scheduled trigger

-   `cmp-ci.yml` is triggered on pushing to a branch. This runs a series sub-workflows/workflow_calls that relate to the cmp app such as cmp-run-tests.yml, `cmp-run-checks.yml` and `cmp-build.yml`.

-   `cmp-beta-release-on-label.yml` is triggered by adding a label to pull requests. This runs a series sub-workflows/workflow_calls that relate to the cmp app such as `cmp-run-tests.yml` and and `cmp-build.yml`

-   `monitoring-ci.yml` is triggered on pushing to a branch. This runs a series jobs that relate to the cdk and monitoring app such as running tests and checks in the `cdk` and `monitoring` directory.

-   `daily-test.yml` is triggered daily using a cron scheduler. This runs a test `yarn test:vendor-list` to check the vendor list is up to date.
