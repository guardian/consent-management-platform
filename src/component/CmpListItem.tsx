import React, { Component } from 'react';
import { css } from '@emotion/core';
import { palette, space } from '@guardian/src-foundations';
import { from } from '@guardian/src-foundations/mq';
import { CmpCollapsible } from './CmpCollapsible';
import { ItemState } from '../types';

const smallSpace = space[2]; // 12px
const mediumSpace = smallSpace + smallSpace / 3; // 16px

const itemContainerStyles = (isNested: boolean) => css`
    border-top: ${isNested ? '0' : `1px solid ${palette.neutral[60]}`};
    padding: ${isNested ? '0' : `10px ${smallSpace}px 6px ${smallSpace}px`};
    ${from.mobileLandscape} {
        padding: ${isNested
            ? '0'
            : `10px ${mediumSpace}px 12px ${mediumSpace}px`};
    }
    position: relative;
`;

interface Props {
    name: string;
    value?: ItemState;
    updateItem?: (updatedValue: boolean) => void;
    isNested?: boolean;
    showError?: boolean;
    expandedByDefault?: boolean;
}

export class CmpListItem extends Component<Props, {}> {
    public render(): React.ReactNode {
        const {
            name,
            value,
            updateItem,
            isNested,
            showError,
            expandedByDefault,
        } = this.props;

        return (
            <li css={itemContainerStyles(!!isNested)}>
                <CmpCollapsible
                    title={name}
                    value={value}
                    updateItem={updateItem}
                    showError={showError}
                    expandedByDefault={expandedByDefault}
                >
                    {this.props.children}
                </CmpCollapsible>
            </li>
        );
    }

    public shouldComponentUpdate(): boolean {
        return !!this.props.updateItem;
    }
}
