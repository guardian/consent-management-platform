# Development instructions

## Prerequisites

### Node.js

Make sure you have installed [Node.js](https://nodejs.org). See the [`.nvmrc`](../.nvmrc) file for the required version.

We recommend using [nvm](https://github.com/creationix/nvm). It is great at managing multiple versions of Node.js on one machine, especially when [configured to automatically use the required version](https://github.com/nvm-sh/nvm#deeper-shell-integration).

### Yarn

We use [Yarn](https://yarnpkg.com/en/) for managing our dependencies.

## Running instructions

```
$ git clone git@github.com:guardian/consent-management-platform.git
$ cd consent-management-platform
$ yarn
```

## Dev Server

```bash
$ yarn dev
```

## Code Quality

You can ensure your code passes code quality tests by running:

```
$ yarn validate
```

This runs our linting tool, the TypeScript compiler and our tests.

You can also run these tasks individually:

```
$ yarn lint
$ yarn tsc
$ yarn test
```

If you get lint errors, you can attempt to automatically fix them with:

```
$ yarn fix
```

## IDE setup

We recommend using [VSCode](https://code.visualstudio.com/).

### Extensions

VSCode should prompt you to install our recommended extensions when you open the project.

You can also find these extensions by searching for `@recommended` in the extensions pane.

## Publishing to NPM

The `consent-management-platform` is available to import from [NPM](https://www.npmjs.com/package/@guardian/consent-management-platform), You must be a member of the `guardian` organisation on NPM to publish new versions of this package.

Once you are ready to publish a new release please follow these steps:

-   Run `yarn release` and follow the prompts
-   Publish the opened github release draft
-   Now check https://www.npmjs.com/package/@guardian/consent-management-platform
