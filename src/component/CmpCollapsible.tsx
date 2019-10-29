import { css } from '@emotion/core';
import { palette } from '@guardian/src-foundations';
import React, { Component } from 'react';
import { CollapseItemButton } from './CollapseItemButton';
import { OnOffRadio } from './OnOffRadio';
import { ItemState } from '../types';

const titleTabStyles = css`
    display: flex;
    cursor: pointer;
    margin-bottom: 18px;
`;

const titleContainerStyles = css`
    flex: 1;
`;

const titleStyles = (collapsed: boolean) => css`
    font-family: 'Guardian Text Sans Web', Helvetica Neue, Helvetica, Arial,
        Lucida Grande, sans-serif;
    font-size: 20px;
    line-height: 22px;
    font-weight: 700;
    color: ${collapsed ? palette.yellow.dark : palette.neutral[100]};
`;

const panelStyles = (collapsed: boolean) => css`
    display: ${collapsed ? 'block' : 'none'};
    padding-left: 20px;

    p {
        font-family: 'Guardian Text Sans Web', Helvetica Neue, Helvetica, Arial,
            Lucida Grande, sans-serif;
        fontsize: 17px;
        lineheight: 24px;
    }
`;

interface Props {
    title: string;
    value?: ItemState;
    updateItem?: (updatedValue: boolean) => void;
    showError?: boolean;
}

interface State {
    collapsed: boolean;
}

export class CmpCollapsible extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            collapsed: false,
        };
    }

    public render(): React.ReactNode {
        const { collapsed } = this.state;
        const { title, value, children, updateItem, showError } = this.props;

        return (
            <>
                <div css={titleTabStyles}>
                    <div
                        css={css`
                            flex-grow: 1;
                            display: flex;
                        `}
                        onClick={() => {
                            this.toggleCollapsed();
                        }}
                    >
                        <CollapseItemButton collapsed={collapsed} />
                        <div css={titleContainerStyles}>
                            <div css={titleStyles(collapsed)}>{title}</div>
                        </div>
                    </div>
                    {value !== undefined && (
                        <OnOffRadio
                            selectedValue={value}
                            onChangeHandler={updateItem}
                            showError={showError}
                        />
                    )}
                </div>
                <div css={panelStyles(collapsed)}>{children}</div>
            </>
        );
    }

    private toggleCollapsed(): void {
        this.setState(state => ({
            collapsed: !state.collapsed,
        }));
    }
}
