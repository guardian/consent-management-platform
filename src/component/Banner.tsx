import React, { Component } from 'react';
import { css } from '@emotion/core';
import { palette } from '@guardian/src-foundations';
import { from } from '@guardian/src-foundations/mq';
import {
    GuPurpose,
    GuPurposeState,
    IabPurpose,
    IabPurposeState,
} from '../types';

const gutterWidth = 20;
const columnWidth = 60;

const gridWidth = (columns: number, gutterMultiple: number): number =>
    columns * columnWidth +
    gutterWidth * (columns - 1) +
    gutterWidth * gutterMultiple;

const bannerStyles = css`
    height: 100px;
    background-color: ${palette.neutral[20]};
    color: ${palette.neutral[100]};
    position: fixed;
    width: 100%;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 9999;
`;

const outerContainerStyles = css`
    height: 100%;
    border: 1px solid red;

    position: relative;
    margin: 0 auto;

    ${from.tablet} {
        max-width: ${gridWidth(9, 2)}px;
    }

    ${from.desktop} {
        max-width: ${gridWidth(12, 2)}px;
    }

    ${from.leftCol} {
        max-width: ${gridWidth(14, 2)}px;
    }

    ${from.wide} {
        max-width: ${gridWidth(16, 2)}px;
    }
`;

const contentContainerStyles = css`
    display: block;
    margin: 0 ${gutterWidth / 2}px;

    ${from.leftCol} {
        padding-left: ${gridWidth(2, 1.5)}px;
    }

    ${from.wide} {
        padding-left: ${gridWidth(3, 1.5)}px;
    }
`;

interface State {
    showInfo: boolean;
    showPurposes: boolean;
}

interface Props {
    guPurposes: GuPurpose[];
    iabPurposes: IabPurpose[];
    onSave: (guState: GuPurposeState, iabState: IabPurposeState) => void;
    onOptionsClick: () => void;
}

class Banner extends Component<Props, State> {
    private guPurposesAllEnable?: GuPurposeState;

    private iabPurposesAllEnable?: IabPurposeState;

    constructor(props: Props) {
        super(props);

        this.state = {
            showInfo: false,
            showPurposes: false,
        };
    }

    public render(): React.ReactNode {
        const { onSave, onOptionsClick } = this.props;

        console.log(onSave, onOptionsClick);

        return (
            <div css={bannerStyles}>
                <div css={outerContainerStyles}>
                    {/* <div className="roundel"></div> */}
                    <div css={contentContainerStyles}>
                        <p>Hello world</p>
                        {/* <div className="title">Your privacy</div>
                        <div className="copy">
                            <p>
                                We use cookies to improve your experience on our
                                site and to show you personalised advertising.
                            </p>
                            <p>
                                To find out more, read our{' '}
                                <a
                                    className="u-underline"
                                    data-link-name="first-pv-consent : to-privacy"
                                    href="https://www.theguardian.com/help/privacy-policy"
                                >
                                    privacy policy
                                </a>{' '}
                                and{' '}
                                <a
                                    className="u-underline"
                                    data-link-name="first-pv-consent : to-cookies"
                                    href="https://www.theguardian.com/info/cookies"
                                >
                                    cookie policy
                                </a>
                                .
                            </p>
                        </div>
                        <div className="iab-elements">
                            <div
                                className="cmp-list-container"
                                id="cmp-info-list"
                            >
                                <button
                                    className="cmp-button"
                                    id="cmp-info-list-button"
                                >
                                    Information that may be used
                                </button>
                                <ul className="cmp-list">
                                    <li>Type of browser and its settings</li>
                                    <li>Cookie information</li>
                                    <li>
                                        Information about other identifiers
                                        assigned to the device
                                    </li>
                                    <li>
                                        The IP address from which the device
                                        accesses a client&apos;s website or
                                        mobile application
                                    </li>
                                    <li>
                                        Information about the geographic
                                        location of the device when it accesses
                                        a website or mobile application
                                    </li>
                                </ul>
                            </div>
                            <div
                                className="cmp-list-container"
                                id="cmp-purpose-button"
                            >
                                <button
                                    className="cmp-button"
                                    id="cmp-purpose-list-button"
                                >
                                    Purposes for storing information
                                </button>
                                <ul className="cmp-list">
                                    {this.renderPurposeList()}
                                </ul>
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>
        );
    }

    private renderPurposeList() {
        const { iabPurposes } = this.props;

        return iabPurposes.map(
            (purpose: IabPurpose): React.ReactNode => {
                return <li key={`iabPurpose${purpose.id}`}>{purpose.name}</li>;
            },
        );
    }

    private enableAll() {
        const { onSave } = this.props;

        const guPurposesAllEnable = Object.keys(this.props.guPurposes).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {},
        );

        const iabPurposesAllEnable = Object.keys(this.props.iabPurposes).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {},
        );

        onSave(guPurposesAllEnable, iabPurposesAllEnable);
    }
}

export { Banner };
