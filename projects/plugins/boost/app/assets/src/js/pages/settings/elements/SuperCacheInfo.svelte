<script lang="ts">
	import { __, sprintf } from '@wordpress/i18n';
	import Notice from '../../../elements/Notice.svelte';
	import { superCacheNoticeDisabledClientStore } from '../../../stores/notice';
	import { measureSuperCacheSaving } from '../../../utils/measure-super-cache-saving';
	import { isSuperCachePluginActive, isSuperCacheEnabled } from '../../../utils/super-cache';

	let testStarted = false;
	let testPromise: Promise< number > | null = null;
	function runTest() {
		testStarted = true;
		testPromise = measureSuperCacheSaving();
	}

	function navToSuperCacheSettings() {
		window.location.href = './options-general.php?page=wpsupercache';
	}

	$: runLabel = testStarted
		? __( 'Re-run test', 'jetpack-boost' )
		: __( 'Run test', 'jetpack-boost' );
</script>

{#if isSuperCacheEnabled()}
	{#if testStarted}
		{#await testPromise}
			<Notice
				title={__( 'Measuring Super Cache Speed', 'jetpack-boost' )}
				message={__( 'Jetpack Boost is testing the speed of your cache.', 'jetpack-boost' )}
				actions={[ { label: runLabel, isLoading: true, disabled: true } ]}
			/>
		{:then testResult}
			<Notice
				title={__( 'Super Cache Speed', 'jetpack-boost' )}
				message={sprintf(
					// translators: %d refers to the number of milliseconds users are saving by using Super Cache.
					__( 'Super Cache is saving your visitors about %d ms', 'jetpack-boost' ),
					testResult
				)}
				actions={[ { label: runLabel, onClick: runTest } ]}
			/>
		{:catch testError}
			<Notice
				level="warning"
				title={__( 'Super Cache Speed', 'jetpack-boost' )}
				message={sprintf(
					// translators: %s is the raw error message
					__( 'We ran into an error measuring your speed: %s', 'jetpack-boost' ),
					testError.message
				)}
				actions={[ { label: runLabel, onClick: runTest } ]}
			/>
		{/await}
	{:else}
		<Notice
			title={__( 'Super Cache detected', 'jetpack-boost' )}
			message={__( 'Find out how much difference it makes for your users.', 'jetpack-boost' )}
			actions={[ { label: runLabel, onClick: runTest } ]}
		/>
	{/if}
{:else if isSuperCachePluginActive() && ! $superCacheNoticeDisabledClientStore}
	<Notice
		level="warning"
		title={__( 'Super Cache is installed but not enabled', 'jetpack-boost' )}
		message={__( 'Enable Super Cache to speed your site up further.', 'jetpack-boost' )}
		actions={[ { label: __( 'Set up', 'jetpack-boost' ), onClick: navToSuperCacheSettings } ]}
		hideCloseButton={false}
		on:onClose={() => {
			$superCacheNoticeDisabledClientStore = true;
		}}
	/>
{/if}
