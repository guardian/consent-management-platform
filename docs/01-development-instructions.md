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

## Releasing

Changes are automatically released to [NPM][].

[NPM]: https://www.npmjs.com/package/@guardian/consent-management-platform

The `main` branch on GitHub is analysed by [semantic-release](https://semantic-release.gitbook.io/) after every push.

If a commit message follows the [conventional commit format](https://www.conventionalcommits.org/en/v1.0.0), semantic-release can determine what types of changes are included in that commit.

If necessary, it will then automatically release a new, [semver](https://semver.org/)-compliant version of the package to NPM.

### Pull requests

Try to write PR titles in the conventional commit format, and [squash and merge](https://docs.github.com/en/free-pro-team@latest/github/collaborating-with-issues-and-pull-requests/about-pull-request-merges#squash-and-merge-your-pull-request-commits) when merging. That way your PR will trigger a release when you merge it (if necessary).
