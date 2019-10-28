import React from 'react';
import { css } from '@emotion/core';
import { ParsedIabVendor } from './ConsentPreferencesDashboard';
import { CmpListItem } from './CmpListItem';

interface Props {
    vendors: ParsedIabVendor[];
}

const cmpListStyles = css`
    margin: 0;
    list-style: none;
`;

export const Vendors = (props: Props) => (
    <ul css={cmpListStyles}>
        <CmpListItem name="Vendors" key={`vendorsCollapsible`}>
            <ul css={cmpListStyles}>
                {props.vendors.map(
                    (
                        vendor: ParsedIabVendor,
                        index: number,
                    ): React.ReactNode => {
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
