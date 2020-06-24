# Consent Management Platform

> Consent management for `*.theguardian.com`.

The CMP applies the CCPA to users in the USA, and TCFv2 to everyone else.

![Types](https://img.shields.io/npm/types/@guardian/consent-management-platform)
[![Generic badge](https://img.shields.io/badge/google-chat-259082.svg)](https://chat.google.com/room/AAAAhlhgDTU)

## Usage

```js
import {
    init,
    onConsentNotification,
} from '@guardian/consent-management-platform';

init({ isInUsa: true });

onConsentNotification(({ tcfState, ccpaState }) => {
    if (ccpaState) {
        console.log(ccpaState); // { doNotSell: true || false }
    }
    if (tcfState) {
        console.log(tcfState); // { 1: true || false, 1: true || false, ... }
    }
});
```

## API

### init(options)

returns: `void`

Adds the relevent privacy framework to the page. It needs to be run before any other API call.

#### options.isInUsa

type: `boolean`

_Required! Throws error if not present._ Declare whether your user is in the USA or not.

### onConsentNotification(callback)

returns: `void`

Callbacks are invoked when the consent state:

-   is acquired
-   changes (eg. if a user changes their privacy preferences).

If the consent state has already been acquired when `onConsentNotification` is called, the callback will be invoked immediately.

#### callback(result)

type: `function`

Reports the user's relevant privacy preferences.

```js
{
    tcfState?: Boolean,
    ccpaState?: Boolean,
}
```

###### result.tcfState

type: `Object` or `undefined`

Reports the user's preferences to each of the TCFv2 purposes:

```js
{
    1: Boolean;
    2: Boolean;
    // etc
}
```

###### result.ccpaState

type: `Object` or `undefined`

Reports whether user has withdrawn consent to sell their data:

```js
{
    doNotSell: Boolean;
}
```

### checkUiWillShow()

returns: `Promise<Boolean>`

The returned promise resolves to `true` if the user will be shown the initial privacy message, or `false` otherwise.

If it's called before `init()`, it will return a rejected promise.

**Example:**

```js
import { checkUiWillShow } from '@guardian/consent-management-platform';

checkUiWillShow()
    .then(result =>
        console.log(result); // true || false
    ).catch(e =>
        console.log("checkUiWillShow() failed:", e); // "checkUiWillShow() failed: called before init()"
    );
```

### showPrivacyManager()

returns: `void`

Surfaces the relevant privacy manager, allowing the user to change their privacy preferences after the initial privacy message.

**Example:**

```js
import { showPrivacyManager } from '@guardian/consent-management-platform';

showPrivacyManager(); // privacy manager is displayed
```

## Developer instructions

If you're looking to develop on the `consent-management-platform` please read our [development instructions](docs/01-development-instructions.md) document.
