import React, { Component } from 'react';
import { css } from '@emotion/core';
import { mobileLandscape, palette, space } from '@guardian/src-foundations';
import { Logo } from './svgs/Logo';
import { ConsentPreferencesDashboard } from './ConsentPreferencesDashboard';
import { SCROLLABLE_ID, CONTENT_ID } from '../config';

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
    ${mobileLandscape} {
        transition: background-color;
        transition-delay: 0.5s;
        transition-duration: 0.5s;
        will-change: background-color;
    }
`;

const showOverlayStyles = css`
    ${mobileLandscape} {
        background-color: rgba(0, 0, 0, 0.7);
    }
`;

const containerStyles = css`
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

const showContainerStyles = (scrollbarWidth: number) => css`
    transform: translateX(calc(-100% + ${scrollbarWidth}px));
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
    cmpVisible: boolean;
}

class ConsentManagementPlatform extends Component<{}, State> {
    scrollableRef: React.RefObject<HTMLDivElement>;

    constructor(props: {}) {
        super(props);

        this.scrollableRef = React.createRef();

        this.state = {
            cmpVisible: false,
        };
    }

    public render(): React.ReactNode {
        let scrollbarWidth = 0;
        const { cmpVisible } = this.state;
        const scrollableElem = this.scrollableRef.current;

        if (scrollableElem) {
            scrollbarWidth =
                scrollableElem.offsetWidth - scrollableElem.clientWidth;
        }

        return (
            <div
                css={css`
                    ${overlayStyles};
                    ${cmpVisible ? showOverlayStyles : ''};
                `}
            >
                <div
                    css={css`
                        ${containerStyles};
                        ${cmpVisible
                            ? showContainerStyles(scrollbarWidth)
                            : ''};
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
                            toggleCmpVisibility={() => {
                                this.setState(prevState => ({
                                    cmpVisible: !prevState.cmpVisible,
                                }));
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export { ConsentManagementPlatform };
