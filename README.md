# Consent Management Platform

Welcome to the Consent Management Platform, a library of useful utilities for managing consent state across \*.theguardian.com. All exports include Typescript definitions.

## What useful utilities does this offer?

### Consent notifications

If you need to conditionally run some code based on a user's consent state you can use the two functions `onGuConsentNotification` and `onIabConsentNotification`.

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

### CMP UI

The library exports The Guardian's CMP as a React component that can easily be imported into your React applications as well as a `shouldShow` function that indicated whether the user should be presented with the CMP.

#### shouldShow

This function returns a boolean, it will be `true` if the user does not have the appropriate consent cookies saved and `false` if they do.

**Example:**

```js
import { shouldShow } from '@guardian/consent-management-platform';

shouldShow(); // true || false
```

#### ConsentManagementPlatform React Component

The properties the `ConsentManagementPlatform` component takes are listed below alongwith their Typescript definitions:

##### onClose: () => void

The `onClose` property accepts a function, this will be executed once the user has submitted their consent, either via the clicking "I'm OK with that" button in the banner, or opening the options modal selecting their choices and clicking the "Save and close" button. You can add whatever logic you want in this function. Because the `ConsentManagementPlatform` component doesn't close itself a typical example of the logic that would be included in this function might be the updating of state to hide the `ConsentManagementPlatform` component.

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
import { shouldShow } from '@guardian/consent-management-platform';
import { ConsentManagementPlatform } from '@guardian/consent-management-platform/lib/ConsentManagementPlatform';

export class App {
    constructor(props) {
        super(props);

        this.state = {
            showCmp: false,
        };
    }

    public componentDidMount() {
        if (shouldShow()) {
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

        return (<>{showCmp && <ConsentManagementPlatform {...props} />}</>);
    }
}
```

## Developer instructions

If you're looking to develop on the `consent-management-platform` please read our [development instructions](docs/01-development-instructions.md) document.
