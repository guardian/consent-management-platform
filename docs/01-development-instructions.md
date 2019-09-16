# Development instructions

## Prerequisites

### Node.js

Make sure you have installed [Node.js](https://nodejs.org). Our reccommended version is `10.15.3`.

We recommend using [nvm](https://github.com/creationix/nvm) (especially combined with [this handy gist](https://gist.github.com/sndrs/5940e9e8a3f506b287233ed65365befb)). It is great at managing multiple versions of Node.js on one machine.

### Yarn

We use [Yarn](https://yarnpkg.com/en/) for managing our dependencies. Our reccommended version is `1.17.3`.

## Running instructions

```
$ git clone git@github.com:guardian/consent-management-platform.git
$ cd consent-management-platform
$ yarn
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

-   Make sure all the changes you want to release have been merged into `Master`.
-   On `master` bump the version number appropriately, we use [semantic versioning](https://docs.npmjs.com/about-semantic-versioning) when bumping the version.
-   Once the version number has been bumped create a new [release](https://github.com/guardian/consent-management-platform/releases) using Github. Make sure to label correctly and add a list of links to PRs merged since the last release.
-   You can now publish to NPM from your local machine. To do this pull `Master`, and then run the following command: `yarn publish --access public --new-version [new version number as stated in package.json]`. This command will validate the code and if it passes validation it will build and publish to NPM.
-   Now check https://www.npmjs.com/package/@guardian/consent-management-platform
