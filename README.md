# Consent Management Platform

Welcome to the Consent Management Platform, a library of useful utilities for managing consent state across \*.theguardian.com.

## What useful utilities does this offer?

### cmp

If you need to conditionally run some code based on a user's consent state you can use the `cmp` module.

This module exposes two functions `onGuConsentNotification` and `onIabConsentNotification`.

#### onGuConsentNotification

This function takes 2 arguments, the first is the purpose name (a `string`) that is relevant to the code your running eg. "functional", "performance", and the second is a callback (a `function`).

When `onGuConsentNotification` is called it will execute the callback immediately, passing it a single argument (a `boolean` or `null`) which indicates the users consent state at that time for the given purpose name.

The `cmp` module also listens for subsequent changes to the user's consent state (eg. if a user saves an update to their consent via the CMP modal), if this happens it will re-execute the callback, passing it a single argument (a `boolean` or `null`) which inidicates the user's updated consent state for the given purpose name.

##### onGuConsentNotification example

```js
import { onGuConsentNotification } from '@guardian/consent-management-platform';

onGuConsentNotification('functional', functionalConsentState => {
    console.log(functionalConsentState); // true || false || null
});
```

#### onIabConsentNotification

This function takes 1 argument, a callback (a `function`).

When `onIabConsentNotification` is called it will execute the callback immediately, passing it a single argument, an object which reflects the consent granted to the IAB purposes. The signature for this object will be:

```
{
    [key: number]: boolean | null;
}
```

The keys in this object will match the IAB purpose IDs from the IAB vendor list.

The `cmp` module will also listens for subsequent changes to the user's consent state (eg. if a user saves an update to their consent via the CMP modal), if this happens it will re-execute the callback, passing it a single argument, an object which reflects the latest consent granted to the IAB purposes.

##### onIabConsentNotification example

```js
import { onIabConsentNotification } from '@guardian/consent-management-platform';

onIabConsentNotification(iabConsentState => {
    console.log(iabConsentState); // { 0: true || false || null, 1: true || false || null, }
});
```

## Developer instructions

If you're looking to develop on the `consent-management-platform` please read our [development instructions](docs/01-development-instructions.md) document.
