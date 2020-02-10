import React, { Component } from 'react';
import { css } from '@emotion/core';
import { palette, space } from '@guardian/src-foundations';
import { from } from '@guardian/src-foundations/mq';
import { headlineSizes, bodySizes } from '@guardian/src-foundations/typography';
import { Button, buttonBrand } from '@guardian/src-button/';
import { ThemeProvider } from 'emotion-theming';
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
import { Roundel } from './svgs/Roundel';

const SCROLLABLE_ID = 'cmpScrollable';

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
    color: ${palette.neutral[7]};
    border-radius: 12px;
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
        color: ${palette.neutral[7]};
    }
`;

const headerStyles = css`
    color: ${palette.neutral[100]};
    background-color: ${palette.brand.main};
    width: 100%;
    padding: ${space[2]}px ${space[2]}px ${space[3]}px ${space[2]}px;
    box-sizing: border-box;

    ${from.mobileLandscape} {
        padding: ${space[2]}px 10px ${space[3]}px 10px;
    }
`;

const primaryHeadlineStyles = (headlineSerif: string) => css`
    font-family: ${headlineSerif};
    font-size: ${headlineSizes.xsmall}rem;
    font-weight: 700;
    line-height: 1.5;

    ${from.leftCol} {
        font-size: ${headlineSizes.small}rem;
    }
`;

const copyContainerStyles = (headlineSerif: string) => css`
    padding: ${space[2]}px ${space[2]}px ${space[3]}px ${space[2]}px;

    ${from.mobileLandscape} {
        padding: ${space[2]}px 10px ${space[3]}px 10px;
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
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    padding-right: ${scrollbarWidth}px; /* Increase/decrease this value for cross-browser compatibility */
    box-sizing: content-box;
`;

const scrollableContainerStyles = (scrollbarWidth: number) => css`
    background-color: ${palette.neutral[100]};
    margin-right: -${scrollbarWidth}px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
`;

const buttonContainerStyles = (bodySerif: string) => css`
    padding: ${space[2]}px ${space[2]}px ${space[3]}px ${space[2]}px;
    color: ${palette.neutral[100]};
    background-color: ${palette.brand.main};
    box-sizing: border-box;
    position: relative;
    z-index: 100;

    a,
    a:visited {
        color: ${palette.neutral[100]};
    }

    ${from.mobileLandscape} {
        padding: ${space[2]}px 10px ${space[3]}px 10px;
    }

    p {
        font-family: ${bodySerif};
        font-size: ${bodySizes.small}rem;
        line-height: 1.35rem;
        font-weight: 700;
        margin-bottom: 8px;
    }

    button + button {
        margin-left: 12px;
    }
`;

const validationErrorStyles = css`
    display: block;
    background-color: ${palette.news.bright};
    position: absolute;
    left: 0;
    right: 0;
    bottom: 100%;
    padding: ${space[1]}px ${space[2]}px ${space[1]}px ${space[2]}px;

    ${from.mobileLandscape} {
        padding: ${space[1]}px 10px ${space[1]}px 10px;
    }
`;

const roundelContainerStyles = css`
    position: absolute;
    padding: 0;
    width: auto;
    height: auto;
    top: 8px;
    right: 8px;

    svg {
        width: 36px;
        height: 36px;
    }
`;
interface State {
    guState: GuPurposeState;
    iabState: IabPurposeState;
    iabNullResponses: number[];
    scrollbarWidth: number;
}

interface Props {
    parsedVendorList: ParsedIabVendorList;
    onSaveAndCloseClick: (iabState: IabPurposeState) => void;
    onEnableAllAndCloseClick: () => void;
    onCancelClick: () => void;
}

class Modal extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            ...getConsentState(true),
            iabNullResponses: [],
            scrollbarWidth: 0,
        };
    }

    public componentDidMount(): void {
        this.hideScrollbar();

        window.addEventListener('resize', () => {
            this.hideScrollbar();
        });

        // This enables scrolling the modal using arrow keys as well
        // as tabing through the items as soon as the modal is shown
        const scrollableElem = document.getElementById(SCROLLABLE_ID);
        if (scrollableElem) {
            (scrollableElem as HTMLElement).focus();
        }
    }

    public render(): React.ReactNode {
        const { parsedVendorList } = this.props;
        const { iabState, iabNullResponses, scrollbarWidth } = this.state;

        return (
            <FontsContext.Consumer>
                {({
                    headlineSerif,
                    bodySerif,
                    bodySans,
                }: FontsContextInterface) => (
                    <>
                        <div css={overlayContainerStyles}></div>
                        <form css={modalStyles}>
                            <div css={headerStyles}>
                                <h1 css={primaryHeadlineStyles(headlineSerif)}>
                                    Your privacy options
                                </h1>
                                <div css={roundelContainerStyles}>
                                    <Roundel />
                                </div>
                            </div>
                            <div
                                css={scrollableContainerStyles(scrollbarWidth)}
                            >
                                <div
                                    id={SCROLLABLE_ID}
                                    css={scrollableAreaStyles(scrollbarWidth)}
                                    tabIndex={-1}
                                >
                                    <div
                                        css={copyContainerStyles(headlineSerif)}
                                    >
                                        <h2
                                            css={css`
                                                font-weight: 700;
                                            `}
                                        >
                                            Please review and manage your data
                                            and privacy settings below.
                                        </h2>
                                    </div>

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
                                </div>
                            </div>
                            <div css={buttonContainerStyles(bodySerif)}>
                                {!!(
                                    iabNullResponses && iabNullResponses.length
                                ) && (
                                    <div
                                        role="alert"
                                        css={validationErrorStyles}
                                    >
                                        <p>
                                            Please set all privacy options to
                                            continue.
                                        </p>
                                    </div>
                                )}
                                <p>
                                    You can change the above settings for this
                                    browser at any time by clicking the privacy
                                    settings link in the footer of the page.
                                </p>
                                <ThemeProvider theme={buttonBrand}>
                                    <div
                                        css={css`
                                            display: flex;
                                            justify-content: flex-start;
                                        `}
                                    >
                                        <Button
                                            priority="primary"
                                            size="default"
                                            iconSide="left"
                                            onClick={() => {
                                                this.saveAndCloseClick();
                                            }}
                                            css={css`
                                                font-family: ${bodySans};
                                            `}
                                        >
                                            Save and close
                                        </Button>
                                        <Button
                                            priority="secondary"
                                            size="default"
                                            onClick={() => {
                                                const {
                                                    onCancelClick,
                                                } = this.props;

                                                onCancelClick();
                                            }}
                                            css={css`
                                                font-family: ${bodySans};
                                            `}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </ThemeProvider>
                            </div>
                        </form>
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
