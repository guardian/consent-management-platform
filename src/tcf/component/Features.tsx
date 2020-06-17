import React from 'react';
import { css } from '@emotion/core';
import { IabFeature } from '../types';
import { CmpListItem } from './CmpListItem';

interface Props {
	features: IabFeature[];
}

const cmpListStyles = css`
	margin: 0;
	list-style: none;
`;

export const Features = (props: Props) => (
	<ul css={cmpListStyles}>
		<CmpListItem name="Features" key={`featuresCollapsible`}>
			<ul css={cmpListStyles}>
				{props.features.map(
					(feature: IabFeature): React.ReactNode => {
						const { id, name, description } = feature;
						return (
							<CmpListItem name={name} key={`feature-${id}`} isNested={true}>
								<p>{description}</p>
							</CmpListItem>
						);
					},
				)}
			</ul>
		</CmpListItem>
	</ul>
);
