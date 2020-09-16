<script>
	import { cmp, onConsentChange } from '../dist/index';
	import { onMount } from 'svelte';

	$: consentState = {};

	$: eventsList = [];

	cmp.willShowPrivacyMessage().then((willShow) => {
		logEvent({ title: 'cmp.willShowPrivacyMessage', payload: willShow });
	});

	onConsentChange((payload) => {
		consentState = payload;

		console.log(consentState);

		logEvent({ title: 'onConsentChange', payload });
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

	onMount(async () => {
		cmp.init({ isInUsa });
	});
</script>

<style>
	* {
		font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial,
			sans-serif, Apple Color Emoji, Segoe UI Emoji;
		font-size: 12px;
	}

	nav,
	label {
		display: flex;
		align-items: center;
	}

	nav {
		padding-bottom: 1em;
	}

	nav * + * {
		margin-left: 1em;
		max-width: 50%;
	}

	main {
		padding-right: 400px;
	}

	summary {
		cursor: pointer;
	}

	#events {
		list-style-type: none;
		padding: 0;
		position: fixed;
		right: 0;
		top: 0;
		bottom: 0;
		width: 400px;
		border-left: black solid 1px;
		overflow: auto;
		margin: 0;
		font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace !important;
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

	summary {
		padding: 0.2em 0.5em;
	}

	summary,
	pre {
		font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace !important;
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

	#consent-state * {
		font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace !important;
	}

	.label {
		width: auto;
		font-weight: normal;
		background-color: oldlace;
		color: deeppink;
	}

	h2 {
		font-weight: normal;
		margin: 1rem 0 0.2rem;
	}
</style>

<main>
	<nav>
		<button on:click={cmp.showPrivacyManager}>open privacy manager</button>
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
			{#each Object.entries(consentState.tcfv2.consents) as [consent, state]}
				<span class={JSON.parse(state) ? 'yes' : 'no'}>{consent}</span>
			{/each}

			<h2>tcfv2.vendorConsents</h2>
			{#each Object.entries(consentState.tcfv2.vendorConsents) as [consent, state]}
				<span class={JSON.parse(state) ? 'yes' : 'no'}>{consent}</span>
			{/each}
		{:else if consentState.ccpa}
			<h2>ccpa.doNotSell</h2><span
				class="label">{consentState.ccpa.doNotSell}</span>
		{:else}
			<h2>¯\_(ツ)_/¯</h2>
		{/if}
	</div>
</main>

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
