<script>
	// always use the build version
	import { cmp, onConsentChange } from '../dist/index';
	import { onMount } from 'svelte';

	if (window.location.hash === '#tcfv2')
		localStorage.setItem('isInUsa', 'false');
	if (window.location.hash === '#ccpa') localStorage.setItem('isInUsa', 'true');

	// allow us to listen to changes on window.guCmpHotFix
	window.guCmpHotFix = new Proxy(window.guCmpHotFix, {
		set: function (target, key, value) {
			target[key] = value;
			console.info('%cwindow.guCmpHotFix', 'color: deeppink;', {
				...window.guCmpHotFix,
			});
			return true;
		},
	});

	function logEvent(event) {
		eventsList = [...eventsList, event];
	}

	let clearPreferences = () => {
		document.cookie.split(';').forEach((cookie) => {
			document.cookie = cookie
				.replace(/^ +/, '')
				.replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
		});
		window.location.reload();
	};

	let setLocation = () => {
		localStorage.setItem('isInUsa', JSON.stringify(isInUsa));
		clearPreferences();
	};

	let isInUsa = JSON.parse(localStorage.getItem('isInUsa'));

	$: consentState = {};
	$: eventsList = [];

	cmp.willShowPrivacyMessage().then((willShow) => {
		logEvent({ title: 'cmp.willShowPrivacyMessage', payload: willShow });
	});

	onConsentChange((payload) => {
		logEvent({ title: 'onConsentChange', payload });
		consentState = payload;
	});

	onMount(async () => {
		// do this loads to make sure that doesn't break things
		cmp.init({ isInUsa });
		cmp.init({ isInUsa });
		cmp.init({ isInUsa });
		cmp.init({ isInUsa });
	});
</script>

<style>
	* {
		font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace;
		font-size: 12px;
	}

	main {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		display: grid;
		grid-template-columns: auto 400px;
		grid-template-rows: auto 1fr;
		grid-template-areas:
			'footer sidebar'
			'main sidebar';
	}

	main > * {
		overflow: auto;
	}

	nav {
		grid-area: footer;
		padding: 0.5rem;
		align-self: end;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		z-index: 1;
	}

	nav * {
		font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial,
			sans-serif, Apple Color Emoji, Segoe UI Emoji;
	}

	nav * + * {
		margin-left: 1em;
		max-width: 50%;
	}

	#consent-state {
		grid-area: main;
		padding: 1rem;
	}

	#events {
		grid-area: sidebar;
		list-style-type: none;
		padding: 0;
		border-left: black solid 1px;
		overflow: auto;
		margin: 0;
	}

	#events li {
		border-bottom: 1px solid #eee;
		padding: 0;
	}

	#events pre {
		margin: 0;
		background-color: oldlace;
		color: deeppink;
		padding: 0.4em 0.5em;
	}

	label {
		display: inline-flex;
		align-items: center;
	}

	summary {
		cursor: pointer;
		padding: 0.2em 0.5em;
	}

	.yes,
	.no,
	.label {
		display: inline-flex;
		min-height: 1.5rem;
		min-width: 1.5rem;
		align-items: center;
		justify-content: center;
		margin-right: 1px;
		margin-bottom: 1px;
		font-weight: normal;
		padding: 0 1ch;
		box-sizing: border-box;
	}

	.yes {
		background-color: chartreuse;
	}

	.no {
		background-color: #ff1a4f;
	}

	.label {
		width: auto;
		font-weight: normal;
		background-color: oldlace;
		color: deeppink;
	}

	h2 {
		font-weight: normal;
		margin: 0 0 0.2rem;
	}

	* + h2 {
		margin-top: 1rem;
	}
</style>

<main>
	<nav>
		<button on:click={cmp.showPrivacyManager} data-cy="pm">open privacy manager</button>
		<button on:click={clearPreferences}>clear preferences</button>
		<label>
			<input type="checkbox" bind:checked={isInUsa} on:change={setLocation} /> in
			USA
		</label>
	</nav>

	<div id="consent-state">
		{#if consentState.tcfv2}
			<h2>tcfv2.eventStatus</h2>
			<span class="label">{consentState.tcfv2.eventStatus}</span>

			<h2>tcfv2.consents</h2>
			{#each Object.entries(consentState.tcfv2.consents) as [purpose, state]}
				<span
					class={JSON.parse(state) ? 'yes' : 'no'}
					data-purpose={purpose}
					data-consent={state}>{purpose}</span>
			{/each}

			<h2>tcfv2.vendorConsents</h2>
			{#each Object.entries(consentState.tcfv2.vendorConsents) as [consent, state]}
				<span class={JSON.parse(state) ? 'yes' : 'no'}>{consent}</span>
			{/each}
		{:else if consentState.ccpa}
			<h2>ccpa.doNotSell</h2><span
				class="label"
				data-donotsell={consentState.ccpa.doNotSell}>{consentState.ccpa.doNotSell}</span>
		{:else}
			<h2>¯\_(ツ)_/¯</h2>
		{/if}
	</div>

	<ol id="events">
		{#each eventsList as { title, payload }}
			<li>
				<details>
					<summary>{title}</summary>
					<pre>{JSON.stringify(payload, null, 4)}</pre>
				</details>
			</li>
		{/each}
	</ol>
</main>
