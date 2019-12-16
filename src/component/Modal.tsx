import React, { Component } from 'react';
import { css } from '@emotion/core';
import { palette, space } from '@guardian/src-foundations';
import { from } from '@guardian/src-foundations/mq';
import { headlineSizes } from '@guardian/src-foundations/typography';
import { Features } from './Features';
import { Vendors } from './Vendors';
import { FontsContext } from './FontsContext';
import { CmpButton } from './CmpButton';
import { getConsentState } from '../store';
import {
    GuPurpose,
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
    height: 95%;
    max-height: 600px;
    width: 95%;
    max-width: 620px;

    color: ${palette.neutral[100]};
    background-color: ${palette.neutral[20]};
    overflow: hidden;

    ${from.mobileLandscape} {
        max-height: 450px;
    }
`;

const headlineStyles = (headlineSerif: string) => css`
    font-size: ${headlineSizes.small}rem;

    ${from.leftCol} {
        font-size: ${headlineSizes.medium}rem;
    }

    ${headlineSerif};
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

const listStyles = css`
    margin: 0;
    list-style: none;
`;

const buttonContainerStyles = css`
    position: sticky;
    bottom: 0;
    width: 100%;
    float: right;
    background-color: ${palette.neutral[20]};
    padding: 12px;

    padding: ${smallSpace / 2}px ${smallSpace}px ${smallSpace}px ${smallSpace}px;

    ${from.mobileLandscape} {
        padding: ${smallSpace / 2}px ${mediumSpace}px ${smallSpace}px
            ${mediumSpace}px;
    }
`;

interface State {
    guState: GuPurposeState;
    iabState: IabPurposeState;
    iabNullResponses: number[];
    scrollbarWidth: number;
}

interface Props {
    guPurposes: GuPurpose[];
    parsedVendorList: ParsedIabVendorList;
    onSave: (guState: GuPurposeState, iabState: IabPurposeState) => void;
    onCancel: () => void;
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
        const { parsedVendorList } = this.props;
        const { iabState, iabNullResponses, scrollbarWidth } = this.state;

        return (
            <FontsContext.Consumer>
                {({ headlineSerif }: FontsContextInterface) => (
                    <>
                        <div css={overlayContainerStyles}></div>
                        <div css={modalStyles}>
                            <div
                                id={SCROLLABLE_ID}
                                css={scrollableAreaStyles(scrollbarWidth)}
                            >
                                <h1 css={headlineStyles(headlineSerif)}>
                                    Your privacy options
                                </h1>
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
                                    <div css={buttonContainerStyles}>
                                        <CmpButton
                                            priority="primary"
                                            onClick={() => {
                                                console.log(
                                                    '***** enabled all',
                                                );
                                                // this.enableAll();
                                            }}
                                        >
                                            Enable all and close
                                        </CmpButton>
                                        <CmpButton
                                            priority="primary"
                                            onClick={() => {
                                                console.log('***** save');
                                                // this.save();
                                            }}
                                        >
                                            Save and continue
                                        </CmpButton>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </>
                )}
            </FontsContext.Consumer>
        );
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
