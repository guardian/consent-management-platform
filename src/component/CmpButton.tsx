import React, { Component } from 'react';
import { css } from '@emotion/core';
// import { palette } from '@guardian/src-foundations';
// import { from } from '@guardian/src-foundations/mq';
import { FontsContext } from './FontsContext';
import { FontsContextInterface } from '../types';

const buttonStyles = (bodySans: string) => css`
    font-size: 16px;
    line-height: 22px;
    font-family: ${bodySans};
    font-weight: 700;
    border-radius: 1000px;
    height: 42px;
    /* display: block; */
    align-items: flex-start;
    justify-content: space-between;
    cursor: pointer;
    /* position: relative; */
    border: 0;
    white-space: nowrap;
    overflow: hidden;
    &:focus {
        outline: none;
    }
`;

const primaryButtonStyles = css`
    color: #121212;
    background: #ffe500;
    padding: 0 20px 0 42px;
`;

const secondaryButtonStyles = css`
    color: #ffffff;
    background: #767676;
    padding: 0 20px;
    margin-left: 12px;
`;

interface Props {
    priority: 'primary' | 'secondary';
    onClick: () => void;
}

class CmpButton extends Component<Props, {}> {
    public render(): React.ReactNode {
        const { priority, onClick } = this.props;
        const primaryButton = priority === 'primary';

        return (
            <FontsContext.Consumer>
                {({ bodySans }: FontsContextInterface) => (
                    <button
                        css={[
                            buttonStyles(bodySans),
                            primaryButton
                                ? primaryButtonStyles
                                : secondaryButtonStyles,
                        ]}
                        onClick={onClick}
                    >
                        {this.props.children}
                    </button>
                )}
            </FontsContext.Consumer>
        );
    }
}

export { CmpButton };
