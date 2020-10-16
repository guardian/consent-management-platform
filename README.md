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
  * [Bundling](#bundling)
- [Managing Consent](#managing-consent)
  * [`cmp.init(options)`](#cmpinitoptions)
  * [`cmp.willShowPrivacyMessage()`](#cmpwillshowprivacymessage)
  * [`cmp.showPrivacyManager()`](#cmpshowprivacymanager)
- [Using Consent](#using-consent)
  * [`onConsentChange(callback)`](#onconsentchangecallback)
  * [`getConsentFor(vendor, consentState)`](#getconsentforvendor-consentstate)
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

### Bundling

This package uses `ES2020`.

If your target environment does not support that, make sure you transpile this package when bundling your application.

## Managing Consent

```js
import { cmp } from '@guardian/consent-management-platform';
```

### `cmp.init(options)`

returns: `void`

Adds the relevent privacy framework to the page. It must be called to enable
privacy management.
If necessary, it will also display the initial privacy message.

#### `options.country`

type: `string`
values: any [2-letter, ISO_3166-1 country code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Decoding_table), e.g. `GB`, `US`, `AU`, …

Declare which country your user is in. Required – *throws an error if
it's missing.*

#### `options.pubData`

type: `Object`

Pass additional parameters for for reporting. Optional.

##### Expected parameters

-   pageViewId - A key used to identify the unique pageview associated with this instance of the CMP. This will be used to link back to a browserId for further reporting; if possible this should be available via the pageview table.

#### Example

```js
cmp.init({
    pubData: {
        browserId: 'gow59fnwohwmshz',
        pageViewId: 'jkao3u2kcbaqk',
    },
    country: 'GB',
});
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
import {
    onConsentChange,
    getConsentFor,
} from '@guardian/consent-management-platform';
```

### `onConsentChange(callback)`

returns: `void`

An event listener that invokes callbacks whenever the consent state:

-   is acquired (e.g. after initialising)
-   changes (eg. if a user changes their privacy preferences)

If the consent state has already been acquired when `onConsentChange` is called,
the callback will be invoked immediately.

#### `callback(consentState)`

type: `function`

Reports the user's privacy preferences.

##### `consentState.tcfv2`

type: `Object` or `undefined`

Reports the user's preferences for each of the TCFv2 purposes, the last CMP
event status, custom vendor consents, flag if GDPR applies, the TC string and addtlConsent string.

If the user is in the USA, it will be `undefined`.

Unlike the [`__tcfapi`](https://github.com/InteractiveAdvertisingBureau/GDPR-Transparency-and-Consent-Framework/blob/master/TCFv2/IAB%20Tech%20Lab%20-%20CMP%20API%20v2.md#how-does-the-cmp-provide-the-api), all ten consents will have a set
boolean value, defaulting to `false` where no explicit consent was given.

```js
{
    gdprApplies: Boolean | undefined, // true - GDPR Applies, false - GDPR Does not apply, undefined - unknown whether GDPR Applies
    tcString: String, // 'base64url-encoded TC string with segments'
    addtlConsent: String, // Google AC string
    eventStatus: String, // 'tcloaded' | 'cmpuishown' | 'useractioncomplete'
    consents: {
        1: Boolean,
        2: Boolean,
        /* … */
        9: Boolean,
        10: Boolean,
    },

    vendorConsents: {
        'abcdefghijklmnopqrstuvwx': Boolean,
        'yz1234567890abcdefghijkl': Boolean,
        'mnopqrstuvwxyz1234567890': Boolean,
        // Sourcpoint IDs, etc.
    }
}
```

##### `consentState.ccpa`

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

### `getConsentFor(vendor, consentState)`

returns: `boolean`

Gets the consent for a given vendor.

#### `vendor`

type: `string`

<details><summary>Supported vendors</summary>

<!-- keep this list up to date with the VendorIDs in src/getConsentFor.ts -->

-   `"a9"`
-   `"acast"`
-   `"braze"`
-   `"comscore"`
-   `"facebook-mobile"`
-   `"fb"`
-   `"firebase"`
-   `"google-analytics"`
-   `"google-mobile-ads"`
-   `"google-sign-in"`
-   `"google-tag-manager"`
-   `"googletag"`
-   `"ias"`
-   `"inizio"`
-   `"lotame"`
-   `"nielsen"`
-   `"ophan"`
-   `"permutive"`
-   `"prebid"`
-   `"redplanet"`
-   `"remarketing"`
-   `"sentry"`
-   `"teads"`
-   `"twitter"`
-   `"youtube-player"`

</details>
If the vendor you need is missing, please [raise an issue](https://git.io/JUzVL) (or a PR!).

#### `consentState`

type: `Object`

The consent object passed to the `onConsentChange` callback.

#### Example

```js
import {
    onConsentChange,
    getConsentFor,
} from '@guardian/consent-management-platform';

onConsentChange((consentState) => {
    const ga = getConsentFor('google-analytics', consentState); // true
    const comscore = getConsentFor('comscore', consentState); // false

    // throws error
    const eowifnwoeifjoweinf = getConsentFor(
        'eowifnwoeifjoweinf',
        consentState,
    );

    // you can still use the consent state for a more complicated task
    const complexConsentCondition = myComplexConsentTask(consentState);
});
```

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
