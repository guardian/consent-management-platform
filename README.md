# Consent Management Platform

Welcome to the Consent Management Platform, a library of useful utilities for managing consent state across \*.theguardian.com.

## What useful utilities does this offer?

### cmp

If you need to conditionally run some code based on a user's consent state you can use the `cmp` module.

This module exposes two functions `onGuConsentNotification` and `onIabConsentNotification`.

#### onGuConsentNotification

This function takes 2 arguments, the first is the purpose name (a `string`) that is relevant to the code you're running eg. "functional" OR "performance", and the second is a callback (a `function`).

When `onGuConsentNotification` is called it will execute the callback immediately, passing it a single argument (a `boolean` or `null`) which indicates the user's consent state at that time for the given purpose name.

The `cmp` module also listens for subsequent changes to the user's consent state (eg. if a user saves an update to their consent via the CMP modal), if this happens it will re-execute the callback, passing it a single argument (a `boolean` or `null`) which inidicates the user's updated consent state for the given purpose name.

**Example:**

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

The keys in this object will match the IAB purpose IDs from the [IAB vendor list](https://vendorlist.consensu.org/vendorlist.json).

The `cmp` module will also listens for subsequent changes to the user's consent state (eg. if a user saves an update to their consent via the CMP modal), if this happens it will re-execute the callback, passing it a single argument, an object which reflects the latest consent granted to the IAB purposes.

**Example:**

```js
import { onIabConsentNotification } from '@guardian/consent-management-platform';

onIabConsentNotification(iabConsentState => {
    console.log(iabConsentState); // { 0: true || false || null, 1: true || false || null, ... }
});
```

### cmpUi

The cmpUi exports useful utilities for users who want to load the CMP UI on their site via an `iframe`.

#### cmpUi.canShow

The `cmpUi.canShow` function returns a boolean to indicate whether the user has already saved their consent state. Users should use this when deciding whether or not to present the CMP UI.

**Example:**

```js
import { cmpUi } from '@guardian/consent-management-platform';

console.log(cmpUi.canShow()); // true | false
```

#### cmpUi.setupMessageHandlers

Users loading the CMP UI on their site via an `iframe` can pass 2 callback functions to `cmpUi.setupMessageHandlers` that will be executed when messages are emitted from the CMP UI `iframe`. The 1st argument (`onReadyCmp`) will be executed when the CMP UI emits a ready message to indicate it has loaded and is ready to be shown. And the 2nd argument (`onCloseCmp`) will be executed when the CMP UI emits a close message to indicate the user has saved their consent or clicked the close button.

**Example:**

```js
import { cmpUi, cmpConfig } from '@guardian/consent-management-platform';

const iframe = document.createElement('iframe');
iframe.src = cmpConfig.CMP_URL;
iframe.style.display = 'none';

const onReadyCmp = () => {
    iframe.style.display = 'block';
};

const onCloseCmp = () => {
    iframe.remove();
};

cmpUi.setupMessageHandlers(onReadyCmp, onCloseCmp);

// IMPORTANT: Always add iframe to page after calling setupMessageHandlers
document.body.appendChild(iframe);
```

### cmpConfig

The file `cmpConfig` exposes some useful config variables related to the CMP.

##### example:

```js
import { cmpConfig } from '@guardian/consent-management-platform';
```

## Developer instructions

If you're looking to develop on the `consent-management-platform` please read our [development instructions](docs/01-development-instructions.md) document.
