# Consent Management Platform

> Consent management for `*.theguardian.com`.

The Guardian CMP handles applying the CCPA to users in the USA, and TCFv2 to everyone else.

![Types](https://img.shields.io/npm/types/@guardian/consent-management-platform)
[![Generic badge](https://img.shields.io/badge/google-chat-259082.svg)](https://chat.google.com/room/AAAAhlhgDTU)

## Managing Consent

```js
import { cmp } from '@guardian/consent-management-platform';
```

### cmp.init(options)

returns: `void`

Adds the relevent privacy framework to the page. It must be called to enable privacy management.

If necessary, it will also display the initial privacy message.

#### options.isInUsa

type: `boolean`

Declare whether your user is in the USA or not. Required – *throws an error if it's missing.*

#### Example

```js
cmp.init({ isInUsa: false });
```

### cmp.willShowPrivacyMessage()

returns: `Promise<Boolean>`

Returns a promise that resolves to `true` if the CMP will show the initial privacy message once it has initialised, or `false` if not.

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

### cmp.showPrivacyManager()

Displays an interface that allows users to manage their privacy settings at any time.

#### Example

```js
cmp.showPrivacyManager();
```

## Using Consent

```js
import { onConsentChange } from '@guardian/consent-management-platform';
```

### onConsentChange(callback)

returns: `void`

An event listener that invokes callbacks whenever the consent state:

-   is acquired (e.g. after initialising)
-   changes (eg. if a user changes their privacy preferences)

If the consent state has already been acquired when `onConsentChange` is called, the callback will be invoked immediately.

#### callback(result)

type: `function`

Reports the user's privacy preferences.

##### result.tcfv2

type: `Object` or `undefined`

Reports the user's preferences for each of the TCFv2 purposes along with custom vendor consents. If the user is in the USA, it will be `undefined`.

```js
{
    consents: {
        1: Boolean,
        2: Boolean,
        // etc.
    },
    lastEvent: String, // 'tcloaded' | 'cmpuishown' | 'useractioncomplete'
    vendorConsents: {
        'abcdefghijklmnopqrstuvwx': Boolean,
        'yz1234567890abcdefghijkl': Boolean,
        'mnopqrstuvwxyz1234567890': Boolean,
        // Sourcpoint IDs, etc.
    }
}
```

##### result.ccpa

type: `Object` or `undefined`

Reports whether user has withdrawn consent to sell their data in the USA. If the user is not in the USA, it will be `undefined`.

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

## TCFv1 (deprecated)

_These should not be used after 15 August 2020, and will be deleted shortly afterwards._

#### oldCmp.onGuConsentNotification

This function takes 2 arguments, the first is the purpose name (a `string`) that is relevant to the code you're running eg. "functional" OR "performance", and the second is a callback (a `function`).

When `oldCmp.onGuConsentNotification` is called it will execute the callback immediately, passing it a single argument (a `boolean` or `null`) which indicates the user's consent state at that time for the given purpose name.

The `cmp` module also listens for subsequent changes to the user's consent state (eg. if a user saves an update to their consent via the CMP modal), if this happens it will re-execute the callback, passing it a single argument (a `boolean` or `null`) which inidicates the user's updated consent state for the given purpose name.

**Example:**

```js
import { oldCmp } from '@guardian/consent-management-platform';

oldCmp.onGuConsentNotification('functional', (functionalConsentState) => {
    console.log(functionalConsentState); // true || false || null
});
```

#### oldCmp.onIabConsentNotification

This function takes 1 argument, a callback (a `function`).

When `oldCmp.onIabConsentNotification` is called it will execute the callback immediately, passing it a single argument, an object which reflects the consent granted to the IAB purposes. The signature for this object will be:

```
{
    [key: number]: boolean | null;
}
```

The keys in this object will match the IAB purpose IDs from the [IAB vendor list](https://vendorlist.consensu.org/vendorlist.json).

The `oldCmp` module will also listens for subsequent changes to the user's consent state (eg. if a user saves an update to their consent via the CMP modal), if this happens it will re-execute the callback, passing it a single argument, an object which reflects the latest consent granted to the IAB purposes.

**Example:**

```js
import { oldCmp } from '@guardian/consent-management-platform';

oldCmp.onIabConsentNotification((iabConsentState) => {
    console.log(iabConsentState); // { 0: true || false || null, 1: true || false || null, ... }
});
```

### TCFv1 UI

The TCFv1 library exports a React component that can be imported into your React applications as well as a `shouldShow` function that indicates whether the user should be shown the CMP.

#### oldCmp.shouldShow

The `oldCmp.shouldShow` function returns a boolean, it will be `true` if the user does not have the appropriate consent cookies saved and `false` if they do. It takes an optional boolean `shouldRepermission`. If this is set to true it will only check for the existence of the IAB cookie, otherwise it will check for both IAB and GU_TK cookies.

**Example:**

```js
import { oldCmp } from '@guardian/consent-management-platform';

oldCmp.shouldShow(); // true || false
```

#### `oldCmp.ConsentManagementPlatform` React Component

The properties the `oldCmp.ConsentManagementPlatform` component takes are listed below along with their Typescript definitions:

##### onClose: () => void

The `onClose` property accepts a function, this will be executed once the user has submitted their consent, either via the clicking "I'm OK with that" button in the banner, or opening the options modal selecting their choices and clicking the "Save and close" button. You can add whatever logic you want in this function. Because the `oldCmp.ConsentManagementPlatform` component doesn't close itself a typical example of the logic that would be included in this function might be the updating of state to hide the `oldCmp.ConsentManagementPlatform` component.

##### source?: string

The `source` property accepts an optional string. The value passed to this will be sent to the consent logs once a user has submitted their consent. The value should indicate the site on which the CMP has been seen: eg. 'manage' for 'manage.theguardian.com'. The default value passed to the logs will be 'www'.

##### variant?: string

The `variant` property accepts an optional string. If a value is passed to this it will be sent to the consent logs to indicate whether the user is within an a/b test related to the CMP. Typically the format for this string should follow: `${testName}-${variantName}`. We can also use the value of this property if we want to a/b test different layouts.

##### fontFamilies?: { headlineSerif: string; bodySerif: string; bodySans: string; }

The `fontFamilies` property accepts an optional object. If passed this object must match the definition used above. The values of `headlineSerif`, `bodySerif` and `bodySans` should be strings that match the `font-family` value in your sites `@font-face` definitions for The Guardian's custom webfonts.

##### forceModal?: boolean

The `forceModal` property accepts an optional boolean. If the value passed is `true` then the component will render the modal without the banner. This should be used when resurfacing the user's consent selections.

**Example**

```js
import { oldCmp } from '@guardian/consent-management-platform';

export class App {
    constructor(props) {
        super(props);

        this.state = {
            showCmp: false,
        };
    }

    public componentDidMount() {
        if (oldCmp.shouldShow()) {
            this.setState({ showCmp: true });
        }
    }

    public render() {
        const { showCmp } = this.state;

        const props = {
            source: 'manage',
            onClose: () => {
                this.setState({ showCmp: false });
            },
            fontFamilies: {
                headlineSerif: 'GH Guardian Headline, Georgia, serif',
                bodySerif: 'GuardianTextEgyptian, Georgia, serif',
                bodySans:
                    'GuardianTextSans, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif',
            },
        };

        return (<>{showCmp && <oldCmp.ConsentManagementPlatform {...props} />}</>);
    }
}
```

## Development

See the [developer docs](docs/01-development-instructions.md).
