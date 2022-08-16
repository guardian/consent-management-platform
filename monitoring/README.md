# Automated Monitoring

This directory contains the logic to monitor the CMP banner in different jurisdictions and environments. This can be executed on a local machine using the commands below.

## Useful commands

-   make sure you've run `yarn install` in the parent directory!
-   you require `frontendDeveloper` janus access
-   `yarn install` to install dependencies
-   `yarn run test:dev` to run the Jest unit tests in watch mode
-   `yarn run lint` to lint the code using ESLint
-   `yarn start` to run lambda handler logic locally. This is an interactive CLI which permits the user to select the Jurisdiction and Environment/Stage.
-   `AWS_PROFILE=frontend yarn run remote` to execute lambda functions in all regions. This is an interactive CLI which permits the user to select the Environment/Stage and AWS Region.

### Local Run Command

```sh
  yarn start --env={ENVIRONMENT} --jurisdiction={JURISDICTION}
```

where ENVIRONMENT = local, code or prod
and JURISDICTION = aus, ccpa or tcfv2

e.g.

```sh
    yarn start --env=code --jurisdiction=ccpa
```

This CLI tool falls back to an interactive tool if any of the parameters passed are incorrect or if the user runs

```sh
    yarn start
```

To run 'local' environment, frontend and dotcom-rendering must be setup and running on your local machine. The defined url for a local instance of frontend is http://localhost:9000. If you'd like to change this base url, update the localBaseURL variable in src/env.ts.

## Transparency and Consent Monitoring Dashboard

There are 4 panels in the Transparency and Consent dashboard illustrating the invocation and error metrics from the lambdas.

https://metrics.gutools.co.uk/d/18KPX0C7k/transparency-and-consent?orgId=1
