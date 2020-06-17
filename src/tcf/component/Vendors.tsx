import React from 'react';
import { css } from '@emotion/core';
import { CmpListItem } from './CmpListItem';
import { ParsedIabVendor } from '../types';
import { VENDORS_ID } from './utils/config';

interface Props {
	vendors: ParsedIabVendor[];
	expandedByDefault?: boolean;
}

const cmpListStyles = css`
	margin: 0;
	list-style: none;
`;

export const Vendors = (props: Props) => (
	<ul id={VENDORS_ID} css={cmpListStyles}>
		<CmpListItem
			name="Vendors"
			expandedByDefault={props.expandedByDefault}
			key={`vendorsCollapsible`}
		>
			<ul css={cmpListStyles}>
				{props.vendors.map(
					(vendor: ParsedIabVendor): React.ReactNode => {
						const { id, name, description } = vendor;

						return (
							<CmpListItem name={name} key={`vendor-${id}`} isNested={true}>
								{description}
							</CmpListItem>
						);
					},
				)}
			</ul>
		</CmpListItem>
	</ul>
);
