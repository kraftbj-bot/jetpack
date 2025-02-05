<script lang="ts">
	import { __, sprintf } from '@wordpress/i18n';
	import Button from '../../elements/Button.svelte';
	import ErrorNotice from '../../elements/ErrorNotice.svelte';
	import ReactComponent from '../../elements/ReactComponent.svelte';
	import ImageCdnRecommendation from '../../react-components/components/image-cdn-recommendation';
	import RefreshIcon from '../../svg/refresh.svg';
	import WarningIcon from '../../svg/warning-outline.svg';
	import { recordBoostEvent, recordBoostEventAndRedirect } from '../../utils/analytics';
	import getIsaErrorSuggestion from '../../utils/get-isa-error-suggestion';
	import MultiProgress from './MultiProgress.svelte';
	import { resetIsaQuery } from './store/isa-data';
	import {
		requestImageAnalysis,
		ISAStatus,
		getSummaryProgress,
		type ISASummaryGroup,
		type ISASummary,
	} from './store/isa-summary';

	export let isCdnActive: boolean;
	export let isaSummary: ISASummary | null;

	function scannedPagesCount( isaGroups: Record< string, ISASummaryGroup > ) {
		return Object.values( isaGroups )
			.map( group => group.scanned_pages )
			.reduce( ( a, b ) => a + b, 0 );
	}

	let submitError: undefined | string;
	let requestingReport = false;
	let errorCode: undefined | number;

	$: status = isaSummary?.status;
	$: groups = isaSummary?.groups || {};
	$: scannedPages = scannedPagesCount( groups );

	/**
	 * Calculate total number of issues.
	 */
	$: totalIssues = groups
		? Object.values( groups ).reduce( ( total, group ) => total + group.issue_count, 0 )
		: 0;

	/**
	 * Work out if there is an error to show in the UI.
	 */
	$: errorMessage =
		submitError ||
		( status === ISAStatus.Stuck &&
			__(
				'Your Image Size Analysis task seems to have gotten stuck, or our system is under unusual load. Please try again. If the issue persists, please contact support.',
				'jetpack-boost'
			) );

	/**
	 * Update suggestion based on error code.
	 */
	$: errorSuggestion = getIsaErrorSuggestion( errorCode );

	/**
	 * Work out whether we have a 'give us a minute' notice to show.
	 */
	$: waitNotice =
		( requestingReport && __( 'Getting ready…', 'jetpack-boost' ) ) ||
		( status === ISAStatus.New && __( 'Warming up the engine…', 'jetpack-boost' ) ) ||
		( status === ISAStatus.Queued &&
			__( 'Give us a few minutes while we go through your images…', 'jetpack-boost' ) );

	/**
	 * Start a new image analysis job.
	 */
	async function startAnalysis() {
		try {
			errorCode = undefined;
			errorMessage = undefined;
			requestingReport = true;
			await requestImageAnalysis();
			resetIsaQuery();
		} catch ( err ) {
			errorCode = err.body?.code;
			errorMessage = err.message;
		} finally {
			requestingReport = false;
		}
	}

	function handleAnalyzeClick() {
		const eventName =
			status === ISAStatus.Completed
				? 'clicked_restart_isa_on_summary_page'
				: 'clicked_start_isa_on_summary_page';
		recordBoostEvent( eventName, {} );
		return startAnalysis();
	}

	/**
	 * Work out whether to recommend the Image CDN. It should show if the CDN is off and no report has been run, or a report has found issues.
	 */
	$: showCDNRecommendation = ! isCdnActive && ( totalIssues > 0 || status === ISAStatus.NotFound );
</script>

{#if ! groups}
	<div class="jb-summary">
		{__( 'Loading…', 'jetpack-boost' )}
	</div>
{:else}
	<!-- Show error messages or "please wait" messages. -->
	{#if errorMessage}
		<div class="jb-error-area">
			<ErrorNotice
				title={__( 'Something has gone wrong.', 'jetpack-boost' )}
				suggestion={errorSuggestion}
			>
				{errorMessage}
			</ErrorNotice>
		</div>
	{:else if waitNotice}
		<div class="jb-summary-line jb-wait-notice">
			{waitNotice}
		</div>
	{/if}

	<!-- Show a summary line if the report is completed. -->
	{#if ! requestingReport && status === ISAStatus.Completed}
		<div class="jb-summary-line">
			{#if totalIssues > 0}
				<div class="jb-has-issues jb-summary">
					<WarningIcon />
					{sprintf(
						// translators: 1: Number of scanned issues found 2: Number of scanned pages
						__(
							'Found a total of %1$d issues after scanning your %2$d most recent pages.',
							'jetpack-boost'
						),
						totalIssues,
						scannedPages
					)}
				</div>
			{:else}
				<div class="jb-summary">
					{sprintf(
						// translators: %d: Number of pages scanned
						__(
							'Congratulations; no issues found after scanning your %d most recent pages.',
							'jetpack-boost'
						),
						scannedPages
					)}
				</div>
			{/if}

			<button
				type="button"
				class="components-button is-link"
				on:click={handleAnalyzeClick}
				disabled={requestingReport}
			>
				<RefreshIcon />
				{__( 'Analyze again', 'jetpack-boost' )}
			</button>
		</div>
	{/if}

	<!-- Show progress if a job is rolling. -->
	{#if ! requestingReport && [ ISAStatus.Completed, ISAStatus.Queued ].includes( status )}
		<MultiProgress summaryProgress={getSummaryProgress( groups )} />
	{/if}

	<!-- Show recommendation to enable Image CDN if it was inactive and issues have been found -->
	{#if showCDNRecommendation}
		<div class="jb-notice">
			<div class="jb-notice__content">
				<ReactComponent this={ImageCdnRecommendation} />
			</div>
		</div>
	{/if}

	<!-- Show a button to view the report if it's in progress or completed. -->
	{#if [ ISAStatus.Queued, ISAStatus.Completed ].includes( status ) && ! requestingReport}
		<div class="jb-button-area">
			<Button
				disabled={requestingReport}
				on:click={() =>
					recordBoostEventAndRedirect(
						'#image-size-analysis/all/1',
						'clicked_view_isa_report_on_summary_page',
						{}
					)}
			>
				{status === ISAStatus.Completed
					? __( 'See full report', 'jetpack-boost' )
					: __( 'View report in progress', 'jetpack-boost' )}
			</Button>
		</div>
	{/if}

	<!-- Show a button to kick off a report -->
	{#if ! [ ISAStatus.New, ISAStatus.Queued, ISAStatus.Completed ].includes( status )}
		<div class="jb-button-area">
			<Button disabled={requestingReport} on:click={handleAnalyzeClick}>
				{status === ISAStatus.Completed
					? __( 'Analyze again', 'jetpack-boost' )
					: __( 'Start image analysis', 'jetpack-boost' )}
			</Button>
		</div>
	{/if}
{/if}
