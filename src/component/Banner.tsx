import React, { Component } from 'react';
import { ThemeProvider } from 'emotion-theming';
import { css } from '@emotion/core';
import { palette } from '@guardian/src-foundations';
import { Button, buttonBrand } from '@guardian/src-button/';
import { SvgCheckmark } from '@guardian/src-svgs';
import { from } from '@guardian/src-foundations/mq';
import { headlineSizes, body } from '@guardian/src-foundations/typography';
import { visuallyHidden } from '@guardian/src-foundations/accessibility';
import { FontsContextInterface, IabPurpose } from '../types';
import { FontsContext } from './FontsContext';
import { Roundel } from './svgs/Roundel';

const INFO_LIST_ID = 'cmpInfoList';
const PURPOSE_LIST_ID = 'cmpPurposeList';

const gutterWidth = 20;
const columnWidth = 60;

const gridWidth = (columns: number, gutterMultiple: number): number =>
    columns * columnWidth +
    gutterWidth * (columns - 1) +
    gutterWidth * gutterMultiple;

const bannerStyles = css`
    background-color: ${palette.brand.main};
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

    font-family: ${headlineSerif};
`;

const collapsibleButtonStyles = (show: boolean) => css`
    border: 0;
    color: ${palette.neutral[100]};
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
        border: 2px solid ${palette.neutral[100]};
        border-top: 0;
        border-left: 0;
        display: inline-block;
        transform: ${show ? 'rotate(-135deg)' : 'rotate(45deg)'};
        height: 6px;
        width: 6px;
    }

    &:hover {
        color: ${palette.brandYellow.main};

        &::before {
            border-color: ${palette.brandYellow.main};
        }
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
    list-style: none;

    li {
        padding-left: 4px;
    }

    li:before {
        display: inline-block;
        content: '';
        border-radius: 6px;
        height: 12px;
        width: 12px;
        margin-right: 8px;
        margin-left: -20px;
        background-color: ${palette.brand.pastel};
    }
`;

const buttonContainerStyles = css`
    margin-top: 20px;

    button + button {
        margin-left: 12px;
    }
`;

const roundelContainerStyles = css`
    position: absolute;
    padding: 0;
    width: auto;
    height: auto;
    display: none;

    svg {
        width: 36px;
        height: 36px;
        display: block;
    }

    ${from.leftCol} {
        top: 12px;
        left: ${gutterWidth}px;
        right: auto;
        bottom: auto;
        display: block;
    }
`;

const visuallyHiddenStyles = css`
    ${visuallyHidden};
`;
interface State {
    showInfo: boolean;
    showPurposes: boolean;
}

interface Props {
    privacyPolicyUrl: string;
    cookiePolicyUrl: string;
    iabPurposes: IabPurpose[];
    onEnableAllAndCloseClick: () => void;
    onOptionsClick: () => void;
}

class Banner extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            showInfo: false,
            showPurposes: false,
        };
    }

    public render(): React.ReactNode {
        const { showInfo, showPurposes } = this.state;
        const {
            onOptionsClick,
            privacyPolicyUrl,
            cookiePolicyUrl,
        } = this.props;

        return (
            <FontsContext.Consumer>
                {({ headlineSerif, bodySerif }: FontsContextInterface) => (
                    <div css={bannerStyles}>
                        <div css={outerContainerStyles}>
                            <div css={roundelContainerStyles}>
                                <Roundel />
                            </div>
                            <div css={contentContainerStyles(bodySerif)}>
                                <h1 css={headlineStyles(headlineSerif)}>
                                    Your privacy
                                </h1>
                                <p>
                                    We use cookies to improve your experience on
                                    our site and to show you personalised
                                    advertising.
                                </p>
                                <p>
                                    To find out more, read our{' '}
                                    <a
                                        data-link-name="first-pv-consent : to-privacy"
                                        href={privacyPolicyUrl}
                                    >
                                        privacy policy
                                    </a>{' '}
                                    and{' '}
                                    <a
                                        data-link-name="first-pv-consent : to-cookies"
                                        href={cookiePolicyUrl}
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
                                    aria-expanded={showInfo}
                                    aria-controls={INFO_LIST_ID}
                                >
                                    <span css={visuallyHiddenStyles}>Show</span>{' '}
                                    Information that may be used
                                </button>
                                <ul
                                    id={INFO_LIST_ID}
                                    css={collapsibleListStyles(showInfo)}
                                >
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
                                    aria-expanded={showPurposes}
                                    aria-controls={PURPOSE_LIST_ID}
                                >
                                    <span css={visuallyHiddenStyles}>Show</span>{' '}
                                    Purposes
                                </button>
                                <ul
                                    id={PURPOSE_LIST_ID}
                                    css={collapsibleListStyles(showPurposes)}
                                >
                                    {this.renderPurposeList()}
                                </ul>

                                <ThemeProvider theme={buttonBrand}>
                                    <div css={buttonContainerStyles}>
                                        <Button
                                            priority="primary"
                                            size="default"
                                            icon={<SvgCheckmark />}
                                            iconSide="left"
                                            onClick={() => {
                                                const {
                                                    onEnableAllAndCloseClick,
                                                } = this.props;

                                                onEnableAllAndCloseClick();
                                            }}
                                        >
                                            I&apos;m OK with that
                                        </Button>
                                        <Button
                                            priority="secondary"
                                            size="default"
                                            onClick={() => {
                                                onOptionsClick();
                                            }}
                                        >
                                            Options
                                        </Button>
                                    </div>
                                </ThemeProvider>
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
}

export { Banner };
