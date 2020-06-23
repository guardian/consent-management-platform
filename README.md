# Consent Management Platform

Welcome to the Consent Management Platform, a library to manage privacy frameworks across \*.theguardian.com, from messaging to reporting the privacy state. All exports include Typescript definitions.

## What utilities does this offer?

### TCF and CCPA privacy frameworks

If you need to use the TCF or CCPA privacy frameworks, you can inititalise them on your page using the `init` function.

### Consent notifications

If you need to conditionally run some code based on a user's consent state you can use the function `onConsentNotification`.

## What is the API?

[init](#init)<br />
[onConsentNotification](#onconsentnotification)<br />
[checkUiWillShow](#checkuiwillshow)<br />
[showPrivacyManager](#showprivacymanager)

### init

`init(options: InitOptions): void`

Calling `init` will add the TCF or the CCPA privacy framework to the page, depending on the configuration options received. We refer to these as TCF mode and CCPA mode, respectively. This function needs to be run before any other API call.

The configuration object that it requires is:

```
interface InitOptions {
	isInUS: boolean;
}
```

If `InitOptions.isInUS` is missing, `init` will default to running in TCF mode.

### onConsentNotification

`onConsentNotification(callback: ConsentCallack): void`

When `onConsentNotification` is called it will add the supplied callback to a list of a callbacks. These will be fired when 1) after the consent state is first checked, and 2) the consent state changes (eg. if a user resurfaces the privacy manager and makes change to their privacy preferences). If the consent state is already known when `onConsentNotification` is called the callback is fired immediately. The signatures for the callback function and its parameters are:

```
interface TcfState {
    [key: string]: boolean;
}

interface CcpaState {
	doNotSell: boolean;
}

interface PrivacyState {
	tcfState?: TcfState;
	ccpaState?: CcpaState;

}

type ConsentCallback = (state: PrivacyState) => void
```

**Example:**

```js
import { onConsentNotification } from '@guardian/consent-management-platform';

onConsentNotification(({ tcfState, ccpaState }) => {
	// Check whether it's in TCF or CCPA mode
	if (tcfState) {
		console.log(tcfState); // { 1: true || false, 1: true || false, ... }
	} else {
		console.log(ccpaState); // { doNotSell: true || false }
	}
});
```

### checkUiWillShow

`checkUiWillShow(): Promise<boolean>`

The `checkUiWillShow` function returns the promise of a boolean. This boolean will be `true` if the user will be shown a TCF or a CCPA privacy message, depending on which mode is running, and `false` otherwise. If called before `init`, it will return a rejected promise.

**Example:**

```js
import { checkUiWillShow } from '@guardian/consent-management-platform';

checkWillShowUi()
    .then(result =>
        console.log(result) // true || false
    ).catch(e =>
        console.log("checkUiWillShow() failed:", e): // "checkUiWillShow() failed: called before init()"
    );
```

### showPrivacyManager

`showPrivacyManager(): void`

When `showPrivacyManager` is called it will surface the TCF's or CCPA's privacy manager, depending on which mode is running (see [init](#init)).

## Developer instructions

If you're looking to develop on the `consent-management-platform` please read our [development instructions](docs/01-development-instructions.md) document.
