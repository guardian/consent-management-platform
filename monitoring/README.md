# Automated Monitoring

This directory defines contains the logic to monitor the CMP banner in different jurisdictions and environments.

## Useful commands

-   `yarn install` to install dependencies
-   `yarn run test:dev` to run the Jest unit tests in watch mode
-   `yarn run lint` to lint the code using ESLint
-   `yarn run start` to run lambda handler logic locally. This is an interactive CLI which permits the user to select the Jurisdiction and Environment/Stage.
-   `yarn run remote` to execute lambda functions in all regions. This is an interactive CLI which permits the user to select the Environment/Stage.
