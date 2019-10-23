import React, { Component } from 'react';
import { css } from '@emotion/core';
import { mobileLandscape } from '@guardian/src-foundations';

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
        transition-delay: 0.6s;
        will-change: background-color;
    }
`;

const showOverlayStyles = css`
    ${mobileLandscape} {
        background-color: rgba(0, 0, 0, 0.7);
    }
`;

interface State {
    cmpVisible: boolean;
}

class ConsentManagementPlatform extends Component<{}, State> {
    constructor(props: {}) {
        super(props);

        this.state = {
            cmpVisible: true,
        };
    }

    public render(): React.ReactNode {
        const { cmpVisible } = this.state;

        return (
            <div
                css={css`
                    ${overlayStyles};
                    ${cmpVisible ? showOverlayStyles : ''};
                `}
            ></div>
        );
    }
}

export { ConsentManagementPlatform };
