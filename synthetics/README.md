# Automated Monitoring

This directory contains the logic to monitor the CMP banner in different jurisdictions and environments. This can be executed on a local machine using the commands below.

## Useful commands

-   make sure you've run `pnpm install` in the parent directory!
-   `pnpm install` to install dependencies
-   `pnpm run test` to run the Jest unit tests in watch mode
-   `pnpm run lint` to lint the code using ESLint
-   `pnpm start` to run handler logic locally. This is an interactive CLI which permits the user to select the Jurisdiction and Environment/Stage.

### Local Run Command

```sh
  pnpm start --stage={STAGE} --jurisdiction={JURISDICTION}
```

where STAGE = local, code or prod
and JURISDICTION = aus, usnat, tcfv2, tcfv2_corp

e.g.

```sh
    pnpm start --env=code --jurisdiction=usnat
```

This CLI tool falls back to an interactive tool if any of the parameters passed are incorrect or if the user runs

```sh
    pnpm start
```

If you get the following error

║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     pnpm exec playwright install                                             ║

delete the node_modules and run  `npx playwright install chromium`.


To run 'local' environment, frontend and dotcom-rendering must be setup and running on your local machine. The defined url for a local instance of frontend is <http://localhost:9000>. If you'd like to change this base url, update the localBaseURL variable in src/env.ts.

## Transparency and Consent Monitoring Dashboard

There are 4 panels in the Transparency and Consent dashboard illustrating the invocation and error metrics from the lambdas.

<https://metrics.gutools.co.uk/d/18KPX0C7k/transparency-and-consent?orgId=1>

For the code version of the dashboard see: <https://metrics.gutools.co.uk/d/Jn8SigMSk/transparency-and-consent-code?orgId=1>

(This link can only be viewed in the office or using the VPN)
