<script lang="ts">
	import { PricingCard } from '@automattic/jetpack-components';
	import React from 'react';
	import { __ } from '@wordpress/i18n';
	import ReactComponent from '../../elements/ReactComponent.svelte';
	import ActivateLicense from '../../react-components/components/activate-license';
	import BackButton from '../../react-components/components/back-button';
	import Footer from '../../react-components/sections/footer';
	import Header from '../../react-components/sections/header';
	import { getUpgradeURL } from '../../stores/connection';
	import Logo from '../../svg/jetpack-green.svg';
	import { recordBoostEvent } from '../../utils/analytics';

	// svelte-ignore unused-export-let - Ignored values supplied by svelte-navigator.
	export let location, navigate;
	export let pricing: ( typeof Jetpack_Boost )[ 'pricing' ];
	export let siteDomain: string;
	export let userConnected: boolean;

	const ctaText = __( 'Upgrade Jetpack Boost', 'jetpack-boost' );

	async function goToCheckout() {
		const eventProps = {};
		await recordBoostEvent( 'checkout_from_pricing_page_in_plugin', eventProps );
		window.location.href = getUpgradeURL( siteDomain, userConnected );
	}

	if ( ! ( 'yearly' in pricing ) ) {
		goToCheckout();
	}

	const activateLicense = React.createElement( ActivateLicense );
</script>

<div id="jb-dashboard" class="jb-dashboard">
	<ReactComponent this={Header} children={activateLicense} />

	<div class="jb-benefits__body">
		<div class="jb-container jb-container--fixed mt-2">
			<ReactComponent this={BackButton} />
			<div class="jb-card">
				<div class="jb-card__content">
					<Logo class="my-2" />
					<h1 class="my-2">{__( "Optimize your website's performance", 'jetpack-boost' )}</h1>
					<p class="jb-card__summary my-2">
						{__(
							'Automatically regenerate critical CSS after site changes, and hunt down image issues with ease.',
							'jetpack-boost'
						)}
					</p>
					<ul class="jb-checklist my-2">
						<li>{__( 'Automatic critical CSS regeneration', 'jetpack-boost' )}</li>
						<li>
							{__( 'Performance scores are recalculated after each change', 'jetpack-boost' )}
						</li>
						<li>{__( 'Automatically scan your site for image size issues', 'jetpack-boost' )}</li>
						<li>
							{__( 'Historical performance scores with Core Web Vitals data', 'jetpack-boost' )}
						</li>
						<li>
							{__(
								'Fine-tune your CDN images with customizable quality settings.',
								'jetpack-boost'
							)}
						</li>
						<li>{__( 'Dedicated email support', 'jetpack-boost' )}</li>
					</ul>
				</div>

				<div class="jb-card__cta px-2 my-4">
					{#if 'yearly' in pricing}
						<!-- svelte-ignore missing-declaration Jetpack_Boost -->
						<ReactComponent
							this={PricingCard}
							title={__( 'Jetpack Boost', 'jetpack-boost' )}
							icon={`${ Jetpack_Boost.site.assetPath }../static/images/forward.svg`}
							priceBefore={pricing.yearly.priceBefore / 12}
							priceAfter={pricing.yearly.priceAfter / 12}
							priceDetails={__( '/month, paid yearly', 'jetpack-boost' )}
							currencyCode={pricing.yearly.currencyCode}
							{ctaText}
							onCtaClick={goToCheckout}
						/>
					{/if}
				</div>
			</div>
			<footer class="jb-footer-note">
				{__(
					'Special introductory pricing, all renewals are at full price. 14 day money back guarantee.',
					'jetpack-boost'
				)}
			</footer>
		</div>
	</div>

	<div class="jb-benefits-footer">
		<ReactComponent this={Footer} />
	</div>
</div>

<style lang="scss">
	.jb-benefits-header {
		padding-block-start: 40px;
		padding-block-end: 40px;
		background-color: var( --jp-white );
		height: unset;

		.jb-dashboard-header__logo {
			max-width: 240px;
			height: unset;
		}

		.jb-container--fixed {
			flex-basis: 100%;

			display: flex;
			align-items: center;
			justify-content: space-between;
			flex-wrap: wrap;
			gap: 24px;
		}
	}

	.jb-benefits__body {
		background-color: var( --jp-white-off );
		padding-block-end: 64px;
	}

	.jb-benefits-footer {
		background-color: var( --jp-white );
	}
</style>
