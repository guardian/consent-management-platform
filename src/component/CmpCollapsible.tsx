import React, { Component } from 'react';
import { css } from '@emotion/core';
import { bodySizes } from '@guardian/src-foundations/typography';
import { CollapseItemButton } from './CollapseItemButton';
import { OnOffRadio } from './OnOffRadio';
import { FontsContext } from './FontsContext';
import { ItemState, FontsContextInterface } from '../types';

const titleTabStyles = css`
    display: flex;
    cursor: pointer;
    margin-bottom: 14px;
`;

const panelStyles = (collapsed: boolean, bodySans: string) => css`
    display: ${collapsed ? 'block' : 'none'};
    padding-left: 20px;

    p {
        font-family: ${bodySans};
        font-size: ${bodySizes.medium}px;
        line-height: 1.5rem;
        margin-bottom: 8px;
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
        const id = title
            .replace(',', '')
            .split(' ')
            .join('-')
            .toLowerCase();
        const panelId = `${id}-panel`;

        return (
            <FontsContext.Consumer>
                {({ bodySans }: FontsContextInterface) => (
                    <>
                        <div css={titleTabStyles}>
                            <div
                                css={css`
                                    flex-grow: 1;
                                    display: flex;
                                    min-height: 25px;
                                `}
                                onClick={() => {
                                    this.toggleCollapsed();
                                }}
                            >
                                <CollapseItemButton
                                    collapsed={collapsed}
                                    title={title}
                                    panelId={panelId}
                                />
                            </div>
                            {value !== undefined && (
                                <OnOffRadio
                                    selectedValue={value}
                                    onChangeHandler={updateItem}
                                    showError={showError}
                                />
                            )}
                        </div>
                        <div
                            css={panelStyles(collapsed, bodySans)}
                            id={panelId}
                        >
                            {collapsed && children}
                        </div>
                    </>
                )}
            </FontsContext.Consumer>
        );
    }

    private toggleCollapsed(): void {
        this.setState(state => ({
            collapsed: !state.collapsed,
        }));
    }
}
