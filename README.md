# Consent Management Platform

[![npm (scoped)](https://img.shields.io/npm/v/@guardian/consent-management-platform)](https://www.npmjs.com/package/@guardian/consent-management-platform)
[![ES version](https://badgen.net/badge/ES/2020/cyan)](https://tc39.es/ecma262/2020/)
![Types](https://img.shields.io/npm/types/@guardian/consent-management-platform)
[![codecov](https://codecov.io/gh/guardian/consent-management-platform/branch/main/graph/badge.svg)](https://codecov.io/gh/guardian/consent-management-platform)

> Consent management for `*.theguardian.com`.

The Guardian CMP handles applying the CCPA to users in the USA,
and TCFv2 to everyone else.

## Table of Contents

<!-- toc -->

- [Installation](#installation)
- [Managing Consent](#managing-consent)
  * [`cmp.init(options)`](#cmpinitoptions)
  * [`cmp.willShowPrivacyMessage()`](#cmpwillshowprivacymessage)
  * [`cmp.showPrivacyManager()`](#cmpshowprivacymanager)
- [Using Consent](#using-consent)
  * [`onConsentChange(callback)`](#onconsentchangecallback)
- [Get consent for particular vendor](#get-consent-for-particular-vendor)
  * [`getConsentFor(vendor, consent)`](#getconsentforvendor-consent)
  * [Example](#example-4)
- [Disabling Consent](#disabling-consent)
  * [`cmp.__disable()`](#cmp__disable)
  * [`cmp.__enable()`](#cmp__enable)
  * [`cmp.__isDisabled()`](#cmp__isdisabled)
  * [Manually](#manually)
- [Development](#development)

<!-- tocstop -->

## Installation

[![Generic badge](https://img.shields.io/badge/google-chat-259082.svg)](https://chat.google.com/room/AAAAhlhgDTU)

```bash
yarn add @guardian/consent-management-platform
```

or

```bash
npm install @guardian/consent-management-platform
```

#### Bundling

This package uses `ES2020`.

If your target environment is older than that, make sure your bundler includes this package for transpilation when building your application.

## Managing Consent

```js
import { cmp } from '@guardian/consent-management-platform';
```

### `cmp.init(options)`

returns: `void`

Adds the relevent privacy framework to the page. It must be called to enable
privacy management.
If necessary, it will also display the initial privacy message.

#### `options.isInUsa`

type: `boolean`

Declare whether your user is in the USA or not. Required – *throws an error if
it's missing.*

#### `options.pubData`

type: `Object`

Pass additional parameters for for reporting. Optional.

#### Example

```js
cmp.init({ pubData: { browserId: 'gow59fnwohwmshz' }, isInUsa: false });
```

### `cmp.willShowPrivacyMessage()`

returns: `Promise<Boolean>`

Returns a promise that resolves to `true` if the CMP will show the initial
privacy message once it has initialised, or `false` if not.

#### Example

```js
cmp.willShowPrivacyMessage()
    .then(willShow =>
        if (willShow) {
            console.log("a privacy message will show as soon as it's ready");
            // e.g. don't show any other banners
        } else {
            console.log('a privacy message will not be shown');
            // e.g. show another banner if you like
        }
    );
```

### `cmp.showPrivacyManager()`

Displays an interface that allows users to manage
their privacy settings at any time.

#### Example

```js
cmp.showPrivacyManager();
```

## Using Consent

```js
import { onConsentChange } from '@guardian/consent-management-platform';
```

### `onConsentChange(callback)`

returns: `void`

An event listener that invokes callbacks whenever the consent state:

-   is acquired (e.g. after initialising)
-   changes (eg. if a user changes their privacy preferences)

If the consent state has already been acquired when `onConsentChange` is called,
the callback will be invoked immediately.

#### `callback(result)`

type: `function`

Reports the user's privacy preferences.

##### `result.tcfv2`

type: `Object` or `undefined`

Reports the user's preferences for each of the TCFv2 purposes, the last CMP
event status and custom vendor consents. If the user is in the USA, it will
be `undefined`. Unlike the original `__tcfapi`, all ten consents will have a set
boolean value, defaulting to `false` where no explicit consent was given.

```js
{
    consents: {
        1: Boolean,
        2: Boolean,
        /* … */
        9: Boolean,
        10: Boolean,
    },
    eventStatus: String, // 'tcloaded' | 'cmpuishown' | 'useractioncomplete'
    vendorConsents: {
        'abcdefghijklmnopqrstuvwx': Boolean,
        'yz1234567890abcdefghijkl': Boolean,
        'mnopqrstuvwxyz1234567890': Boolean,
        // Sourcpoint IDs, etc.
    }
}
```

##### `result.ccpa`

type: `Object` or `undefined`

Reports whether user has withdrawn consent to sell their data in the USA.
If the user is not in the USA, it will be `undefined`.

```js
{
    doNotSell: Boolean;
}
```

#### Example

```js
import { onConsentChange } from '@guardian/consent-management-platform';

onConsentChange(({ tcfv2, ccpa }) => {
    if (tcfv2) {
        console.log(tcfv2); // { 1: true || false, 1: true || false, ... }
    }

    if (ccpa) {
        console.log(ccpa); // { doNotSell: true || false }
    }
});
```

## Get consent for particular vendor

```js
import { getConsentFor } from '@guardian/consent-management-platform';
```

### `getConsentFor(vendor, consent)`

returns: `boolean`

A method to get the consent for each particular custom vendor from Sourcepoint

params:

#### `vendor`: string representing the key of the Vendor Id
    Check VendorIds (inside `src/types/index.ts`) to see if the vendor you are trying to use is already configured.
    If not please raise an issue at https://git.io/JUzVL

#### `consent`: the consent object been returned from `onConsentChange` callback


### Example

```
    import { getConsentFor, onConsentChange } from '@guardian/consent-management-platform`

    onConsentChange(consent => {
        const ga = getConsentFor('google-analytics', consent); // true
        const comscore = getConsentFor('comscore', consent); // false

        // throws error
        const eowifnwoeifjoweinf = getConsentFor('eowifnwoeifjoweinf', consent);

        // you can still use the consent state for a more complicated logic
        const complexConsentCondition = myComplexConsentTask(consent);
    })
```

Make sure the vendor you are trying to is included inside VendorIds

## Disabling Consent

It is possible to disable the CMP entirely in the current browser, which can be useful for testing host applications.

### `cmp.__disable()`

returns: `void`

#### Example

```js
cmp.__disable(); // CMP won't run even if you try
```

### `cmp.__enable()`

returns: `void`

#### Example

```js
cmp.__enable(); // CMP will work as normal
```

### `cmp.__isDisabled()`

returns: `boolean`

#### Example

```js
cmp.__isDisabled(); // => true/false
```

### Manually

Set a `gu-cmp-disabled=true` cookie. This is the same as running `cmp.__disable()`.

Removing it is the same as running `cmp.__enable()`.

## Development

See the [developer docs](docs/01-development-instructions.md).
