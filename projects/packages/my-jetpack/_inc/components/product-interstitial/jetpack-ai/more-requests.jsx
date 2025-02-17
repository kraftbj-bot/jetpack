/**
 * External dependencies
 */
import { AdminPage, Button, Col, Container, Text, H3 } from '@automattic/jetpack-components';
import { __ } from '@wordpress/i18n';
import classNames from 'classnames';
import React from 'react';
import { Link } from 'react-router-dom';
/**
 * Internal dependencies
 */
import GoBackLink from '../../go-back-link';
import jetpackAiImage from '../jetpack-ai.png';
import styles from './style.module.scss';

// Disabled for now
const onClick = () => {};

/**
 * JetpackAIInterstitialMoreRequests component
 *
 * @param {object} props                 - Component props.
 * @param {Function} props.onClickGoBack - onClick handler for the "Back" button.
 * @returns {object}                       JetpackAIInterstitialMoreRequests react component.
 */
export function JetpackAIInterstitialMoreRequests( { onClickGoBack = () => {} } ) {
	const title = __( 'Do you need more requests for Jetpack AI Assistant?', 'jetpack-my-jetpack' );
	const longDescription = __(
		'Allow us to assist you in discovering the optimal plan tailored to your requirements, ensuring you can continue using the most advanced AI technology Jetpack has to offer.',
		'jetpack-my-jetpack'
	);

	return (
		<AdminPage showHeader={ false } showBackground={ false }>
			<Container horizontalSpacing={ 3 } horizontalGap={ 3 }>
				<Col className={ styles[ 'product-interstitial__header' ] }>
					<GoBackLink onClick={ onClickGoBack } reload={ false } />
				</Col>
				<Col>
					<Container
						className={ styles.container }
						horizontalSpacing={ 0 }
						horizontalGap={ 0 }
						fluid
					>
						<Col sm={ 4 } md={ 4 } lg={ 7 }>
							<div className={ classNames( styles.card ) }>
								<div>
									<H3>{ title }</H3>
									<Text mb={ 3 }>{ longDescription }</Text>
									<div className={ styles[ 'buttons-row' ] }>
										<Button onClick={ onClick }>
											{ __( 'Contact Us', 'jetpack-my-jetpack' ) }
										</Button>
										<Link to={ '/' } onClick={ onClickGoBack }>
											<Button variant="secondary">{ __( 'Back', 'jetpack-my-jetpack' ) }</Button>
										</Link>
									</div>
								</div>
							</div>
						</Col>
						<Col
							sm={ 4 }
							md={ 4 }
							lg={ 5 }
							className={ classNames( styles.imageContainer, styles.aiImageContainer ) }
						>
							<img src={ jetpackAiImage } alt="Jetpack AI" />
						</Col>
					</Container>
				</Col>
			</Container>
		</AdminPage>
	);
}
