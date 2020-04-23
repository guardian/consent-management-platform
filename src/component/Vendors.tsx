import React from 'react';
import { css } from '@emotion/core';
import { CmpListItem } from './CmpListItem';
import { ParsedIabVendor } from '../types';

interface Props {
    vendors: ParsedIabVendor[];
    expandedByDefault?: boolean;
}

const cmpListStyles = css`
    margin: 0;
    list-style: none;
`;

export const Vendors = (props: Props) => (
    <ul css={cmpListStyles}>
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
                            <CmpListItem
                                name={name}
                                key={`vendor-${id}`}
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
