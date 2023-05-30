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

## Testing

### CMP App

1. In the base directory, Run yarn validate to check lint, test and build commands. The command below executes all the required commands to ensure your code passed code quality tests:

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

2. In the base directory, Run yarn start to serve the test-page.

```
$ yarn start
```

### Monitoring Directory

1. Change directory to monitoring and run yarn validate to check lint, test and build commands

```
$ cd monitoring
$ yarn validate
```

2. Run yarn start and test against prod

```
$ yarn start --env=prod --jurisdiction=tcfv2
```

### Symlink

The yarn link command allows you to load a module from anywhere on your computer.

1. In the command line in your terminal, navigate to the base directory. Run:

```
yarn link
```

This will create a global link allowing consent-management-platform to be globally accessible by your other projects.

2. Navigate to the repo that will test your app. In the root of this folder, run

```

yarn link @guardian/consent-management-platform

```

This is where you link the repo to the dependent component. Note: The link name should be the dependency npm package name taken from the name property in package.json.

3. Once you’ve developed your changes and tested, you can unlink.

In your parent project terminal, go ahead and run npm unlink fancy-button to unlink the dependency.

```
yarn unlink @guardian/consent-management-platform

```

### Extensions

VSCode should prompt you to install our recommended extensions when you open the project.

You can also find these extensions by searching for `@recommended` in the extensions pane.

## Releasing

Changes are automatically released to [NPM][].

[npm]: https://www.npmjs.com/package/@guardian/consent-management-platform

The `main` branch on GitHub is analysed by [semantic-release](https://semantic-release.gitbook.io/) after every push.

If a commit message follows the [conventional commit format](https://www.conventionalcommits.org/en/v1.0.0), semantic-release can determine what types of changes are included in that commit.

If necessary, it will then automatically release a new, [semver](https://semver.org/)-compliant version of the package to NPM.

### Pull requests

Try to write PR titles in the conventional commit format, and [squash and merge](https://docs.github.com/en/free-pro-team@latest/github/collaborating-with-issues-and-pull-requests/about-pull-request-merges#squash-and-merge-your-pull-request-commits) when merging. That way your PR will trigger a release when you merge it (if necessary).
