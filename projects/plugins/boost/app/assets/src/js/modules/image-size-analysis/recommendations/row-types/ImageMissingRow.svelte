<script lang="ts">
	import { __ } from '@wordpress/i18n';
	import { removeGetParams } from '../../../../utils/remove-get-params';
	import Device from '../components/Device.svelte';
	import Pill from '../components/Pill.svelte';
	import RowTitle from '../components/RowTitle.svelte';
	import TableRow from './TableRow.svelte';
	import TableRowHover from './TableRowHover.svelte';
	import type { ImageDataType } from '../../store/zod-types';

	export let enableTransition: boolean;
	export let details: ImageDataType;

	const title = details.image.url.split( '/' ).pop();
</script>

<TableRow {enableTransition} expandable={false}>
	<svelte:fragment slot="main">
		<div class="jb-thumbnail__image--missing">
			{__( 'Image Missing', 'jetpack-boost' )}
		</div>

		<div class="jb-table-row__title">
			<RowTitle title={removeGetParams( title )} url={details.page.url} />
		</div>

		<div class="jb-table-row__potential-size">
			<Pill color="#facfd2">? KB</Pill>

			<div class="jb-arrow">→</div>

			<Pill color="#d0e6b8">? KB</Pill>
		</div>

		<div class="jb-table-row__hover-content">
			<TableRowHover
				edit_url={details.page.edit_url}
				instructions={__(
					'This image does not appear to load. Please check the URL in the relevant page.',
					'jetpack-boost'
				)}
			/>
		</div>

		<div class="jb-table-row__device">
			<Device device={details.device_type} />
		</div>

		<div class="jb-table-row__page">
			<a href={details.page.url}>{details.page.title}</a>
		</div>
	</svelte:fragment>
</TableRow>
