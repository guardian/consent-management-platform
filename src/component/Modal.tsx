import React, { Component } from 'react';
import { css } from '@emotion/core';
import { palette, space } from '@guardian/src-foundations';
import { from } from '@guardian/src-foundations/mq';
import { headlineSizes, bodySizes } from '@guardian/src-foundations/typography';
import { Button } from '@guardian/src-button/';
import { SvgArrowRightStraight } from '@guardian/src-svgs';
import { Features } from './Features';
import { Vendors } from './Vendors';
import { FontsContext } from './FontsContext';
import { getConsentState } from '../store';
import {
    GuPurposeState,
    ParsedIabVendorList,
    IabPurposeState,
    FontsContextInterface,
} from '../types';
import { IabPurposes } from './IabPurposes';

const SCROLLABLE_ID = 'scrollable';
const smallSpace = space[2]; // 12px
const mediumSpace = smallSpace + smallSpace / 3; // 16px

const overlayContainerStyles = css`
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 9998;
    background-color: ${palette.neutral[7]};
    opacity: 0.8;
`;

const modalStyles = css`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    color: ${palette.neutral[100]};
    background-color: ${palette.neutral[20]};
    overflow: hidden;
    height: 95%;
    max-height: 600px;
    width: 95%;
    max-width: 620px;
    display: flex;
    flex-direction: column;
    ${from.mobileLandscape} {
        max-height: 450px;
    }

    a,
    a:visited {
        text-decoration: underline;
        color: ${palette.neutral[100]};
    }
`;

const headerStyles = css`
    padding: 8px 8px 12px 8px;
    ${from.mobileLandscape} {
        padding: 8px 10px 12px 10px;
    }
    background-color: ${palette.neutral[20]};
    width: 100%;
    border-bottom: 1px solid ${palette.neutral[60]};
`;

const primaryHeadlineStyles = (headlineSerif: string) => css`
    font-size: ${headlineSizes.small}rem;

    ${from.leftCol} {
        font-size: ${headlineSizes.medium}rem;
    }

    font-family: ${headlineSerif};
`;

const copyContainerStyles = (headlineSerif: string) => css`
    padding: 8px 8px 12px 8px;

    ${from.mobileLandscape} {
        padding: 8px 10px 12px 10px;
    }

    font-family: ${headlineSerif};

    h2 {
        font-size: ${headlineSizes.xxxsmall}rem;
        line-height: 1.35rem;

        ${from.phablet} {
            font-size: ${headlineSizes.xxsmall}rem;
        }
    }
`;

const scrollableAreaStyles = (scrollbarWidth: number) => css`
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    padding-right: ${scrollbarWidth}px; /* Increase/decrease this value for cross-browser compatibility */
    box-sizing: content-box;
`;

const formStyles = (scrollbarWidth: number) => css`
    margin-right: -${scrollbarWidth}px;
`;

const buttonContainerStyles = (bodySerif: string) => css`
    position: sticky;
    bottom: 0;
    padding: 8px 8px 12px 8px;
    border-top: 1px solid ${palette.neutral[60]};
    z-index: 100;

    ${from.mobileLandscape} {
        padding: 8px 10px 12px 10px;
    }

    p {
        font-family: ${bodySerif};
        font-size: ${bodySizes.small}rem;
        line-height: 1.35rem;
        font-weight: 700;
    }

    ::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        opacity: 0.95;
        background-color: ${palette.neutral[20]};
        z-index: -1;
    }
`;

const primaryButtonStyles = css`
    color: ${palette.neutral[7]};
    background-color: ${palette.brandYellow.main};

    :hover {
        background-color: ${palette.brandYellow.main};
    }
`;

const validationErrorStyles = css`
    display: block;
    background-color: ${palette.news.bright};
    position: absolute;
    left: 0;
    right: 0;
    bottom: 100%;
    padding: 4px 8px 6px 8px;

    ${from.mobileLandscape} {
        padding: 4px 10px 6px 10px;
    }
`;

interface State {
    guState: GuPurposeState;
    iabState: IabPurposeState;
    iabNullResponses: number[];
    scrollbarWidth: number;
}

interface Props {
    privacyPolicyUrl: string;
    parsedVendorList: ParsedIabVendorList;
    onSaveAndCloseClick: (iabState: IabPurposeState) => void;
    onEnableAllAndCloseClick: () => void;
    onCancelClick: () => void;
}

class Modal extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            ...getConsentState(),
            iabNullResponses: [],
            scrollbarWidth: 0,
        };
    }

    public componentDidMount(): void {
        this.hideScrollbar();

        window.addEventListener('resize', () => {
            this.hideScrollbar();
        });
    }

    public render(): React.ReactNode {
        const { parsedVendorList, privacyPolicyUrl } = this.props;
        const { iabState, iabNullResponses, scrollbarWidth } = this.state;

        return (
            <FontsContext.Consumer>
                {({ headlineSerif, bodySerif }: FontsContextInterface) => (
                    <>
                        <div css={overlayContainerStyles}></div>
                        <div css={modalStyles}>
                            <div css={headerStyles}>
                                <h1 css={primaryHeadlineStyles(headlineSerif)}>
                                    Your privacy options
                                </h1>
                            </div>
                            <div
                                id={SCROLLABLE_ID}
                                css={scrollableAreaStyles(scrollbarWidth)}
                            >
                                <div css={copyContainerStyles(headlineSerif)}>
                                    <h2>
                                        Please review and manage your data and
                                        privacy settings below.
                                    </h2>
                                </div>
                                <form css={formStyles(scrollbarWidth)}>
                                    <IabPurposes
                                        iabPurposes={parsedVendorList.purposes}
                                        iabState={iabState}
                                        updateItem={(
                                            id: number,
                                            updatedValue: boolean,
                                        ) => {
                                            this.updateIabState(
                                                id,
                                                updatedValue,
                                            );
                                        }}
                                        showError={(id: number) =>
                                            iabNullResponses.includes(id)
                                        }
                                    />
                                    <Features
                                        features={parsedVendorList.features}
                                    />
                                    <Vendors
                                        vendors={parsedVendorList.vendors}
                                    />
                                    <div css={buttonContainerStyles(bodySerif)}>
                                        {!!(
                                            iabNullResponses &&
                                            iabNullResponses.length
                                        ) && (
                                            <div
                                                role="alert"
                                                css={validationErrorStyles}
                                            >
                                                <p>
                                                    Please set all privacy
                                                    options to continue.
                                                </p>
                                            </div>
                                        )}
                                        <p>
                                            You can change the above settings
                                            for this browser at any time by
                                            accessing our{' '}
                                            <a
                                                href={privacyPolicyUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                privacy policy
                                            </a>
                                            .
                                        </p>
                                        <div
                                            css={css`
                                                display: flex;
                                                justify-content: flex-end;
                                            `}
                                        >
                                            <Button
                                                priority="primary"
                                                size="default"
                                                icon={<SvgArrowRightStraight />}
                                                iconSide="right"
                                                css={primaryButtonStyles}
                                                onClick={() => {
                                                    const {
                                                        onEnableAllAndCloseClick,
                                                    } = this.props;

                                                    onEnableAllAndCloseClick();
                                                }}
                                            >
                                                Enable all
                                            </Button>
                                            <Button
                                                priority="primary"
                                                size="default"
                                                icon={<SvgArrowRightStraight />}
                                                iconSide="right"
                                                css={css`
                                                    margin-left: 12px;
                                                    ${primaryButtonStyles};
                                                `}
                                                onClick={() => {
                                                    this.saveAndCloseClick();
                                                }}
                                            >
                                                Save
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </>
                )}
            </FontsContext.Consumer>
        );
    }

    private saveAndCloseClick(): void {
        const { onSaveAndCloseClick } = this.props;
        const { iabState } = this.state;

        const iabNullResponses: number[] = Object.keys(iabState)
            .filter(key => iabState[parseInt(key, 10)] === null)
            .map(key => parseInt(key, 10));

        if (iabNullResponses.length > 0) {
            this.setState({
                iabNullResponses,
            });
        } else {
            onSaveAndCloseClick(iabState);
        }
    }

    private updateIabState(purposeId: number, value: boolean): void {
        this.setState(prevState => ({
            iabState: {
                ...prevState.iabState,
                [purposeId]: value,
            },
            iabNullResponses: prevState.iabNullResponses
                ? prevState.iabNullResponses.filter(
                      iabNullResponse => iabNullResponse !== purposeId,
                  )
                : [],
        }));
    }

    private hideScrollbar(): void {
        const scrollableElem = document.getElementById(SCROLLABLE_ID);

        if (!scrollableElem) {
            return;
        }

        const scrollbarWidth =
            scrollableElem.offsetWidth - scrollableElem.clientWidth;

        this.setState({
            scrollbarWidth,
        });
    }
}

export { Modal };
