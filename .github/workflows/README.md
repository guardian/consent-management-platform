# Workflow Directory

This folder consists of the workflow/action files for continuous integration and deployment in Github Action.

Below are the following workflows that are triggered by specific actions i.e pushing to a branch, scheduled trigger

1. [`monitoring-ci.yml`](monitoring-ci.yml)

-   Trigger: Pushing to a branch
-   Description: Initiates a series of jobs related to the `cdk` and `monitoring` app. This includes running tests and checks within the `cdk` and `monitoring` directories.
