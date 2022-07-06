# Automated Monitoring

This directory contains the logic to monitor the CMP banner in different jurisdictions and environments. This can be executed on a local machine using the commands below.

## Useful commands

-   `yarn install` to install dependencies
-   `yarn run test:dev` to run the Jest unit tests in watch mode
-   `yarn run lint` to lint the code using ESLint
-   `yarn start` to run lambda handler logic locally. This is an interactive CLI which permits the user to select the Jurisdiction and Environment/Stage.
-   `yarn run remote` to execute lambda functions in all regions. This is an interactive CLI which permits the user to select the Environment/Stage and AWS Region.

### Local Run Command

```sh
  yarn start --env={ENVIRONMENT} --jurisdiction={JURISDICTION}
```

where ENVIRONMENT = code or prod
and JURISDICTION = aus, ccpa or tcfv2

e.g.

```sh
    yarn start --env=code --jurisdiction=ccpa
```

This CLI tool falls back to an interactive tool if any of the parameters passed are incorrect or if the user runs

```sh
    yarn start
```
