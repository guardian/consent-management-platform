import React from 'react';
import { css } from '@emotion/core';
import { CmpListItem } from './CmpListItem';
import { IabFeature, IabPurpose, ParsedIabVendor } from '../types';

type ListItem = IabPurpose | IabFeature | ParsedIabVendor;

interface Props {
	name: string;
	listItems: ListItem[];
}

const listStyles = css`
	margin: 0;
	list-style: none;
`;

export const List = (props: Props) => {
	const { name, listItems } = props;
	return (
		<ul css={listStyles}>
			<CmpListItem name={name} key={`${name}Collapsible`}>
				<ul css={listStyles}>
					{listItems.map(
						(item: ListItem): React.ReactNode => {
							const { id, name: itemName, description } = item;

							return (
								<CmpListItem
									name={itemName}
									key={`${name}-${id}`}
									isNested={true}
								>
									{description}
								</CmpListItem>
							);
						},
					)}
				</ul>
			</CmpListItem>
		</ul>
	);
};
