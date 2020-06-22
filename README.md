# Consent Management Platform

Welcome to the Consent Management Platform, a library of useful utilities for managing consent state across \*.theguardian.com. All exports include Typescript definitions.

## What useful utilities does this offer?

### TCF and CCPA privacy frameworks

If you need to use Sourcepoint's implementation of the TCF or CCPA privacy frameworks, you can inititalise them on your page using the `init` function.

### Consent notifications

If you need to conditionally run some code based on a user's consent state you can use the function `onConsentNotification`.

## What is the API?

### init

`init(options: InitOptions): void`

This functions tale 1 argument, a configuration object.

When `init` is called, it will add Sourcepoint's implementation of the TCF or the CCPA privacy frameworks to the page, depending on the configuration options received. In the rest of this document we will refer to these and TCF mode and CCPA mode, respectively. It needs to be run before any other API call.

The configuration object that it requires is:

```
interface InitOptions {
	useCcpa: boolean;
}
```

If `options.useCcpa` is missing, `init` will default to running in TCF mode.

### onConsentNotification

`onConsentNotification(callback: ConsentCallack): void`

This function takes 1 argument, a callback.

When `onConsentNotification` is called it will execute the callback immediately, passing it two arguments, an object which reflects the TCF state (or `null` when in CCPA mode) and a boolean which reflects the CCPA state (or `null` when in TCF mode).

The package also listens for subsequent changes to the user's privacy settings (eg. if a user resurfaces the privacy manager and makes change to their privacy preferences). If this happens it will re-execute the callback, passing it the update consent state.

The signatures for the callback function and its parameters are:

```
interface TcfState {
    [key: string]: boolean
}

type CcpaState = boolean

type ConsentCallback = (tcfSate: TcfState | null, ccpaState: CcpaState | null) => void
```

The keys in `TCFState` will match the TCF purpose IDs.
The value of `ccpaState` will be the reverse of the [CCPA opt-out flag](https://github.com/InteractiveAdvertisingBureau/USPrivacy/blob/master/CCPA/US%20Privacy%20String.md#us-privacy-string-format) when in CCPA mode. This is to provide a homogenous way to handle consent between the TCF and the CCPA frameworks where `true` means consent has been given and `false` means consent has been denied.

If `onConsentNotification` is called before `init`, it will do nothing.

**Example:**

```js
import { onConsentNotification } from '@guardian/consent-management-platform';

onConsentNotification((tcfState, ccpaState) => {
	// Check whether it's in TCF or CCPA mode
	if (tcfState !== null) {
		console.log(tcfState); // { 1: true || false, 1: true || false, ... }
	} else {
		console.log(tcfState); // true || false
	}
});
```

### checkWillShowUi

`checkWillShowUi(): Promise<boolean>`

The `checkWillShowUi` function returns the promise of a boolean. This boolean will be `true` if the user will shown a TCF or a CCPA privacy message, depending on which mode is running, and `false` otherwise.

If `checkWillShowUi` is called before `init`, it will return a rejected promise.

**Example:**

```js
import { checkWillShowUi } from '@guardian/consent-management-platform';

checkWillShowUi()
    .then(result =>
        console.log(result) // true || false
    ).catch(e =>
        console.log("checkWillShowUi() failed:", e): // "checkWillShowUi() failed: called before init()"
    );
```

### showPrivacyManager

`showPrivacyManager(): void`

When `showPrivacyManager` is called it will surface the TCF's or CCPA's privacy manager, depending on which mode is running (see [init](#init)).

## Developer instructions

If you're looking to develop on the `consent-management-platform` please read our [development instructions](docs/01-development-instructions.md) document.
