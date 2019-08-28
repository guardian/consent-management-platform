# Consent Management Platform

Welcome to the Consent Management Platform, a library of useful utilities for managing consent state across \*.theguardian.com.

## What useful utilities does this offer?

### cmp

If you need to conditionally run some code based on a user's consent state you can use the `cmp` module.

This module exposes a function `onConsentNotification`. This function takes 2 arguments, the first is the purpose name (a `string`) that is relevant to the code your running eg. "functional", "performance" or "advertisement", and the second is a callback (a `function`).

When `onConsentNotification` is called it will execute the callback immediately, passing it a single argument (a `boolean` or `null`) which inidicates the users consent state at that time for the given purpose name.

The `cmp` module also listens for subsequent changes to the user's consent state (eg. if a user saves an update to their consent via the CMP modal), if this happens it will re-execute the callback, passing it a single argument (a `boolean` or `null`) which inidicates the user's updated consent state for the given purpose name.

#### cmp example

```js
import { onConsentNotification } from '@guardian/consent-management-platform';

onConsentNotification('functional', functionalConsentState => {
    console.log(functionalConsentState); // true || false || null
});
```

## Developer instructions

If you're looking to develop on the `consent-management-platform` please read our [development instructions](docs/01-development-instructions.md) document.
