import { css } from '@emotion/core';
import { palette } from '@guardian/src-foundations';
import React from 'react';

const collapseItemButtonStyles = (collapsed: boolean) => css`
    background-color: transparent;
    border: 0;
    box-sizing: border-box;
    cursor: pointer;
    outline: none;
    padding: 0;
    position: relative;
    width: 20px;
    height: 20px;
    margin-right: 3px;
    margin-left: -3px;
    > * {
        pointer-events: none;
    }
    ::before {
        position: absolute;
        top: ${collapsed ? '7px' : '5px'};
        left: 6px;
        border: 2px solid ${palette.brandYellow.main};
        border-top: 0;
        border-left: 0;
        content: '';
        display: inline-block;
        transform: ${collapsed ? 'rotate(-135deg)' : 'rotate(45deg)'};
        height: 6px;
        width: 6px;
    }
`;

interface Props {
    collapsed: boolean;
}

export const CollapseItemButton: React.FC<Props> = ({ collapsed }: Props) => {
    return <button type="button" css={collapseItemButtonStyles(collapsed)} />;
};
