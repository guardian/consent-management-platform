# Consent Management Platform

Welcome to the Consent Management Platform, a library of useful utilities for managing consent state across \*.theguardian.com.

## Development prerequisites

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
