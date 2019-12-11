import React, { Component } from 'react';
import { css } from '@emotion/core';
import { palette } from '@guardian/src-foundations';
// import { Button } from '@guardian/src-button/';
// import { SvgCheckmark } from '@guardian/src-svgs';
import { from } from '@guardian/src-foundations/mq';
import { headlineSizes, body } from '@guardian/src-foundations/typography';
import {
    FontsContextInterface,
    GuPurpose,
    GuPurposeState,
    IabPurpose,
    IabPurposeState,
} from '../types';
import { FontsContext } from './FontsContext';
import { CmpButton } from './CmpButton';

const gutterWidth = 20;
const columnWidth = 60;

const gridWidth = (columns: number, gutterMultiple: number): number =>
    columns * columnWidth +
    gutterWidth * (columns - 1) +
    gutterWidth * gutterMultiple;

const bannerStyles = css`
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

const contentContainerStyles = (bodySerif: string) => css`
    display: block;
    padding-bottom: 12px;
    margin: 0 ${gutterWidth / 2}px;
    max-width: ${gridWidth(9, 0)}px;

    ${from.mobileLandscape} {
        padding-left: ${gutterWidth / 2}px;
        padding-right: ${gutterWidth / 2}px;
    }

    ${from.leftCol} {
        padding-left: ${gridWidth(2, 1.5)}px;
        padding-right: 0;
        padding-bottom: 24px;
    }

    ${from.wide} {
        padding-left: ${gridWidth(3, 1.5)}px;
    }

    p {
        ${body.medium()};
        font-family: ${bodySerif};
    }

    a {
        color: ${palette.neutral[100]};
        text-decoration: none;
        border-bottom: 0.0625rem solid ${palette.neutral[60]};
        transition: border-color 0.15s ease-out;
    }

    a:hover {
        border-color: ${palette.neutral[100]};
    }
`;

const headlineStyles = (headlineSerif: string) => css`
    font-size: ${headlineSizes.small}rem;

    ${from.leftCol} {
        font-size: ${headlineSizes.medium}rem;
    }

    ${headlineSerif};
`;

const collapsibleButtonStyles = (show: boolean) => css`
    border: 0;
    color: currentColor;
    background-color: transparent;
    padding: 0;
    position: relative;
    padding-left: 24px;
    margin-left: -4px;
    margin-bottom: ${show ? '8px' : 0};

    &:focus {
        outline: none;
    }

    &::before {
        content: '';
        position: absolute;
        top: ${show ? '10px' : '6px'};
        left: 6px;
        border: 2px solid ${palette.brandYellow.main};
        border-top: 0;
        border-left: 0;
        display: inline-block;
        transform: ${show ? 'rotate(-135deg)' : 'rotate(45deg)'};
        height: 6px;
        width: 6px;
    }
`;

const collapsibleListStyles = (show: boolean) => css`
    margin: 0;
    margin-bottom: ${show ? '8px' : 0};
    max-height: ${show ? '500px' : 0};
    transition: ${show
        ? 'max-height 0.25s ease-in'
        : 'max-height 0.15s ease-out'};
    overflow-y: hidden;
    padding-left: 36px;
    list-style-position: outside;

    // &::after {
    //     content: '';
    //     height: 8px;
    //     display: block;
    // }

    // li {
    //     padding-top: 4px;
    // }
`;

const buttonContainerStyles = css`
    margin-top: 20px;
`;

// const buttonStyles = css`
//     border: 1px solid red;
//     /* &:focus { // This rule gets overwridden when the focus attribute is applied
//         outline: none;
//         box-shadow: 0;
//     } */
// `;

// const buttonWithMarginStyles = css`
//     ${buttonStyles};
//     margin-left: 12px;
// `;

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
        const { showInfo, showPurposes } = this.state;
        const { onOptionsClick } = this.props;

        return (
            <FontsContext.Consumer>
                {({ headlineSerif, bodySerif }: FontsContextInterface) => (
                    <div css={bannerStyles}>
                        <div css={outerContainerStyles}>
                            {/* <div className="roundel"></div> */}
                            <div css={contentContainerStyles(bodySerif)}>
                                <h2 css={headlineStyles(headlineSerif)}>
                                    Your privacy
                                </h2>
                                <p>
                                    We use cookies to improve your experience on
                                    our site and to show you personalised
                                    advertising.
                                </p>
                                <p>
                                    To find out more, read our{' '}
                                    <a
                                        data-link-name="first-pv-consent : to-privacy"
                                        href="https://www.theguardian.com/help/privacy-policy"
                                    >
                                        privacy policy
                                    </a>{' '}
                                    and{' '}
                                    <a
                                        data-link-name="first-pv-consent : to-cookies"
                                        href="https://www.theguardian.com/info/cookies"
                                    >
                                        cookie policy
                                    </a>
                                    .
                                </p>
                                <button
                                    css={collapsibleButtonStyles(showInfo)}
                                    onClick={() => {
                                        this.setState({
                                            showInfo: !showInfo,
                                        });
                                    }}
                                >
                                    Information that may be used
                                </button>
                                <ul css={collapsibleListStyles(showInfo)}>
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
                                <button
                                    css={collapsibleButtonStyles(showPurposes)}
                                    onClick={() => {
                                        this.setState({
                                            showPurposes: !showPurposes,
                                        });
                                    }}
                                >
                                    Purposes
                                </button>
                                <ul css={collapsibleListStyles(showPurposes)}>
                                    {this.renderPurposeList()}
                                </ul>
                                <div css={buttonContainerStyles}>
                                    <CmpButton
                                        priority="primary"
                                        onClick={() => {
                                            this.enableAll();
                                        }}
                                    >
                                        I&apos;m OK with that
                                    </CmpButton>
                                    <CmpButton
                                        priority="secondary"
                                        onClick={onOptionsClick}
                                    >
                                        Options
                                    </CmpButton>
                                    {/* <Button
                                        priority="primary"
                                        size="default"
                                        icon={<SvgCheckmark />}
                                        iconSide="left"
                                        css={buttonStyles}
                                        onClick={() => {
                                            this.enableAll();
                                        }}
                                    >
                                        I&apos;m OK with that
                                    </Button>
                                    <Button
                                        priority="secondary"
                                        size="default"
                                        css={buttonWithMarginStyles}
                                        onClick={() => {
                                            onOptionsClick();
                                        }}
                                    >
                                        Options
                                    </Button> */}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </FontsContext.Consumer>
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
