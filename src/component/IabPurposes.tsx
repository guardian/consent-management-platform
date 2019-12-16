import React from 'react';
import { css } from '@emotion/core';
import { CmpListItem } from './CmpListItem';
import { IabPurpose, IabPurposeState } from '../types';

interface Props {
    iabPurposes: IabPurpose[];
    iabState: IabPurposeState;
    updateItem: (id: number, updatedValue: boolean) => void;
    showError: (id: number) => boolean;
}

const cmpListStyles = css`
    margin: 0;
    list-style: none;
`;

export const IabPurposes = (props: Props) => {
    const { iabPurposes, iabState, updateItem, showError } = props;

    return (
        <ul css={cmpListStyles}>
            {iabPurposes.map(
                (purpose: IabPurpose): React.ReactNode => {
                    const { id, name, description } = purpose;

                    return (
                        <CmpListItem
                            name={name}
                            value={iabState[id]}
                            updateItem={(updatedValue: boolean) => {
                                updateItem(id, updatedValue);
                            }}
                            key={`purpose-${id}`}
                            showError={showError(id)}
                        >
                            <p>{description}</p>
                        </CmpListItem>
                    );
                },
            )}
        </ul>
    );
};
