import { Button } from '@automattic/jetpack-components';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, chevronDown, external, check } from '@wordpress/icons';
import cs from 'classnames';
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useProduct } from '../../hooks/use-product';
import styles from './style.module.scss';

export const PRODUCT_STATUSES = {
	ACTIVE: 'active',
	INACTIVE: 'inactive',
	ERROR: 'error',
	ABSENT: 'plugin_absent',
	ABSENT_WITH_PLAN: 'plugin_absent_with_plan',
	NEEDS_PURCHASE: 'needs_purchase',
	NEEDS_PURCHASE_OR_FREE: 'needs_purchase_or_free',
	CAN_UPGRADE: 'can_upgrade',
};

const ActionButton = ( {
	status,
	admin,
	name,
	slug,
	onActivate,
	additionalActions,
	onManage,
	onFixConnection,
	isFetching,
	isInstallingStandalone,
	isDeactivatingStandalone,
	className,
	onAdd,
} ) => {
	const [ isDropdownOpen, setIsDropdownOpen ] = useState( false );
	const [ currentAction, setCurrentAction ] = useState( {} );
	const { detail } = useProduct( slug );
	const { manageUrl, purchaseUrl } = detail;
	const isManageDisabled = ! manageUrl;

	const isBusy = isFetching || isInstallingStandalone || isDeactivatingStandalone;
	const hasAdditionalActions = additionalActions?.length > 0;

	const buttonState = useMemo( () => {
		return {
			variant: ! isBusy ? 'primary' : undefined,
			disabled: isBusy,
			className,
		};
	}, [ isBusy, className ] );

	const getStatusAction = useCallback( () => {
		switch ( status ) {
			case PRODUCT_STATUSES.ABSENT:
			case PRODUCT_STATUSES.ABSENT_WITH_PLAN: {
				const buttonText =
					status === PRODUCT_STATUSES.ABSENT
						? sprintf(
								/* translators: placeholder is product name. */
								__( 'Get %s', 'jetpack-my-jetpack' ),
								name
						  )
						: sprintf(
								/* translators: placeholder is product name. */
								__( 'Install %s', 'jetpack-my-jetpack' ),
								name
						  );
				return {
					...buttonState,
					href: `#/add-${ slug }`,
					size: 'small',
					variant: 'link',
					weight: 'regular',
					label: buttonText,
					onClick: null,
				};
			}
			case PRODUCT_STATUSES.NEEDS_PURCHASE:
			case PRODUCT_STATUSES.CAN_UPGRADE: {
				const upgradeText = __( 'Upgrade', 'jetpack-my-jetpack' );
				const purchaseText = __( 'Purchase', 'jetpack-my-jetpack' );
				const buttonText = purchaseUrl ? upgradeText : purchaseText;

				return {
					...buttonState,
					href: purchaseUrl || `#/add-${ slug }`,
					size: 'small',
					variant: 'primary',
					weight: 'regular',
					label: buttonText,
					onClick: onAdd,
				};
			}
			case PRODUCT_STATUSES.NEEDS_PURCHASE_OR_FREE:
				return {
					...buttonState,
					href: `#/add-${ slug }`,
					size: 'small',
					variant: 'primary',
					weight: 'regular',
					label: __( 'Start for free', 'jetpack-my-jetpack' ),
					onClick: onAdd,
				};
			case PRODUCT_STATUSES.ACTIVE: {
				const viewText = __( 'View', 'jetpack-my-jetpack' );
				const manageText = __( 'Manage', 'jetpack-my-jetpack' );
				const buttonText = purchaseUrl ? viewText : manageText;

				return {
					...buttonState,
					disabled: isManageDisabled || buttonState?.disabled,
					href: manageUrl,
					size: 'small',
					variant: 'secondary',
					weight: 'regular',
					label: buttonText,
					onClick: onManage,
				};
			}
			case PRODUCT_STATUSES.ERROR:
				return {
					...buttonState,
					href: '#/connection',
					size: 'small',
					variant: 'primary',
					weight: 'regular',
					label: __( 'Fix connection', 'jetpack-my-jetpack' ),
					onClick: onFixConnection,
				};
			case PRODUCT_STATUSES.INACTIVE:
				return {
					...buttonState,
					href: '',
					size: 'small',
					variant: 'secondary',
					weight: 'regular',
					label: __( 'Activate', 'jetpack-my-jetpack' ),
					onClick: onActivate,
				};
			default:
				return null;
		}
	}, [
		buttonState,
		isManageDisabled,
		manageUrl,
		name,
		onActivate,
		onAdd,
		onFixConnection,
		onManage,
		purchaseUrl,
		slug,
		status,
	] );

	const allActions = useMemo(
		() =>
			hasAdditionalActions ? [ ...additionalActions, getStatusAction() ] : [ getStatusAction() ],
		[ additionalActions, getStatusAction, hasAdditionalActions ]
	);

	const onChevronClick = useCallback( () => {
		setIsDropdownOpen( ! isDropdownOpen );
	}, [ isDropdownOpen ] );

	// By default, we set the first "addition action" as the current action shown on the card.
	// If there are none, set it to the status action.
	useEffect( () => {
		setCurrentAction( allActions[ 0 ] );
	}, [ allActions ] );

	if ( ! admin ) {
		return (
			<Button { ...buttonState } size="small" variant="link" weight="regular">
				{
					/* translators: placeholder is product name. */
					sprintf( __( 'Learn about %s', 'jetpack-my-jetpack' ), name )
				}
			</Button>
		);
	}

	const dropdown = hasAdditionalActions && (
		<div className={ styles.dropdown }>
			<ul className={ styles.dropdownMenu }>
				{ [ ...additionalActions, getStatusAction() ].map( ( { label, isExternalLink }, index ) => {
					const onDropdownMenuItemClick = () => {
						setCurrentAction( allActions[ index ] );
						setIsDropdownOpen( false );
					};

					return (
						<li key={ index }>
							{ /* eslint-disable-next-line react/jsx-no-bind */ }
							<button onClick={ onDropdownMenuItemClick } className={ styles.dropdownItem }>
								<div className={ styles.dropdownItemLabel }>
									{ label }
									{ isExternalLink && <Icon icon={ external } size={ 16 } /> }
								</div>

								{ label === currentAction.label && (
									<div className={ styles.activeActionCheckmark }>
										<Icon icon={ check } size={ 24 } fill="white" />
									</div>
								) }
							</button>
						</li>
					);
				} ) }
			</ul>
		</div>
	);

	return (
		<>
			<div
				className={ cs(
					styles.actionButton,
					hasAdditionalActions ? styles.hasAdditionalActions : null
				) }
			>
				<Button { ...buttonState } { ...currentAction }>
					{ currentAction.label }
				</Button>
				{ hasAdditionalActions && (
					<button
						className={ cs(
							styles.dropdownChevron,
							currentAction.variant === 'primary' ? styles.primary : styles.secondary
						) }
						onClick={ onChevronClick }
					>
						<Icon
							icon={ chevronDown }
							size={ 24 }
							fill={ currentAction.variant === 'primary' ? 'white' : 'black' }
						/>
					</button>
				) }
				{ isDropdownOpen && dropdown }
			</div>
		</>
	);
};

export default ActionButton;
