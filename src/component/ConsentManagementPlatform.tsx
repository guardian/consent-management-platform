import React, { Component } from 'react';
import { css } from '@emotion/core';
import { mobileLandscape, palette, space } from '@guardian/src-foundations';
import { Logo } from './svgs/Logo';
import { ConsentPreferencesDashboard } from './ConsentPreferencesDashboard';
import { SCROLLABLE_ID, CONTENT_ID } from './utils/config';
import { setSource, setVariant } from '../store';

const TRANSITION_TIME = 1000;

const overlayStyles = css`
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    padding: 0;
    margin: 0;
    z-index: 9999;
    background-color: transparent;
    display: none;
    ${mobileLandscape} {
        transition: background-color;
        transition-delay: ${TRANSITION_TIME / 2}ms;
        transition-duration: ${TRANSITION_TIME / 2}ms;
        will-change: background-color;
    }
`;

const activeOverlayStyles = css`
    display: block;
`;

const showOverlayStyles = css`
    ${mobileLandscape} {
        background-color: rgba(0, 0, 0, 0.7);
    }
`;

const scrollableStyles = css`
    background-color: ${palette.brand.main};
    border: 0;
    height: 100%;
    width: 100%;
    max-width: 576px;
    position: absolute;
    top: 0;
    left: 100%;
    ${mobileLandscape} {
        width: 30%;
        min-width: 480px;
    }
    transform: translateX(0);
    transition: transform 1s ease-in-out;
    will-change: transform;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
`;

const showScrollableStyles = (scrollableWidth: number) => css`
    transform: translateX(-${scrollableWidth}px);
`;

const contentWidthStyles = css`
    width: 100%;
    ${mobileLandscape} {
        width: 95%;
        max-width: 450px;
    }
`;

const headerStyles = css`
    position: sticky;
    top: 0;
    left: 0;
    background-color: ${palette.brand.main};
    z-index: 200;
    ${contentWidthStyles};
    border-bottom: 1px solid ${palette.brand.pastel};
    ${mobileLandscape} {
        border-right: 1px solid ${palette.brand.main};
    }
`;

const logoContainer = css`
    padding: 6px 0 12px 0;
    height: 100%;
    width: 100%;
    display: flex;
    ::before {
        content: '';
        display: block;
        flex: 1;
        height: 100%;
    }
`;

const logoStyles = css`
    margin-right: ${space[2]}px;
    height: 55px;

    ${mobileLandscape} {
        margin-right: 0;
        height: 90px;
    }

    path {
        fill: ${palette.neutral[100]};
    }
`;

const contentStyles = css`
    min-height: 100%;
    box-sizing: border-box;
    background-color: ${palette.brand.dark};
    border-right: 0;
    ${contentWidthStyles};
    ${mobileLandscape} {
        border-right: 1px solid ${palette.brand.pastel};
        box-sizing: content-box;
    }
`;

interface State {
    active: boolean;
    visible: boolean;
}

interface Props {
    onClose: () => void;
    source?: string;
    variant?: string;
}

class ConsentManagementPlatform extends Component<Props, State> {
    scrollableRef: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);

        this.scrollableRef = React.createRef();

        this.state = {
            active: false,
            visible: false,
        };

        if (props.source) {
            setSource(props.source);
        }

        if (props.variant) {
            setVariant(props.variant);
        }
    }

    public render(): React.ReactNode {
        let scrollableWidth = 0;
        const { visible, active } = this.state;
        const scrollableElem = this.scrollableRef.current;

        if (scrollableElem) {
            scrollableWidth = scrollableElem.clientWidth;
        }

        return (
            <div
                css={css`
                    ${overlayStyles};
                    ${active ? activeOverlayStyles : ''};
                    ${visible ? showOverlayStyles : ''};
                `}
            >
                <div
                    css={css`
                        ${scrollableStyles};
                        ${visible ? showScrollableStyles(scrollableWidth) : ''};
                    `}
                    id={SCROLLABLE_ID}
                    ref={this.scrollableRef}
                >
                    <div css={headerStyles}>
                        <div css={logoContainer}>
                            <Logo css={logoStyles} />
                        </div>
                    </div>
                    <div css={contentStyles} id={CONTENT_ID}>
                        <ConsentPreferencesDashboard
                            showCmp={() => {
                                this.setState(
                                    {
                                        active: true,
                                    },
                                    () => {
                                        this.setState({
                                            visible: true,
                                        });
                                    },
                                );
                            }}
                            hideCmp={() => {
                                this.setState(
                                    {
                                        visible: false,
                                    },
                                    () => {
                                        // delay by TRANSITION_TIME before deactivating
                                        setTimeout(() => {
                                            this.setState(
                                                {
                                                    active: false,
                                                },
                                                () => {
                                                    this.props.onClose();
                                                },
                                            );
                                        }, TRANSITION_TIME);
                                    },
                                );
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export { ConsentManagementPlatform };
