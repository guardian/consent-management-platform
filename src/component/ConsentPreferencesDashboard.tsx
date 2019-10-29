import { css } from '@emotion/core';
import React, { Component } from 'react';
import {
    focusHalo,
    mobileMedium,
    mobileLandscape,
    palette,
    size,
    space,
    transitions,
} from '@guardian/src-foundations';
import { ConsentString } from 'consent-string';
import { CmpListItem } from './CmpListItem';
import { Vendors } from './Vendors';
import { Features } from './Features';
import { ArrowIcon } from './svgs/ArrowIcon';
import { IAB_VENDOR_LIST_URL } from '../config';
import { readIabCookie } from '../cookies';
import {
    IabFeature,
    IabPurpose,
    IabPurposeState,
    IabVendor,
    IabVendorList,
    ParsedIabVendorList,
} from '../types';
import { save } from '../consent-storage';

const PURPOSES_ID = 'cmpPurposes';
const privacyPolicyURL = 'https://www.theguardian.com/info/privacy';
const cookiePolicyURL = 'https://www.theguardian.com/info/cookies';
const smallSpace = space[2]; // 12px
const mediumSpace = smallSpace + smallSpace / 3; // 16px

const formStyles = css`
    color: ${palette.neutral[100]};
    padding: ${smallSpace}px ${smallSpace}px 0 ${smallSpace}px;

    ${mobileLandscape} {
        padding: ${smallSpace}px ${mediumSpace}px 0 ${mediumSpace}px;
    }

    h1 {
        font-size: 20px;
        line-height: 24px;
        font-weight: 700;
        font-family: 'Guardian Egyptian Web', Georgia, serif;
        margin-bottom: 12px;
    }

    p {
        margin-bottom: 16px;
        font-size: 17px;
        line-height: 24px;
        font-family: 'Guardian Text Egyptian Web', Georgia, serif;
    }

    a,
    a:visited {
        text-decoration: underline;
        color: ${palette.neutral[100]};
    }

    ::after {
        margin-left: ${-smallSpace}px;
        margin-right: ${-smallSpace}px;
        ${mobileLandscape} {
            margin-left: ${-mediumSpace}px;
            margin-right: ${-mediumSpace}px;
        }
        content: '';
        background-image: repeating-linear-gradient(
            to bottom,
            ${palette.brand.pastel},
            ${palette.brand.pastel} 1px,
            transparent 1px,
            transparent 4px
        );
        background-repeat: repeat-x;
        background-position: bottom;
        background-size: 1px 13px;
        background-color: ${palette.brand.dark};
        content: '';
        clear: left;
        display: block;
        height: 13px;
    }
`;

const purposesContainerStyles = css`
    margin-left: -${smallSpace}px;
    margin-right: -${smallSpace}px;

    ${mobileLandscape} {
        margin-left: -${mediumSpace}px;
        margin-right: -${mediumSpace}px;
    }
`;

const cmpListStyles = css`
    margin: 0;
    list-style: none;
`;

const buttonContainerStyles = css`
    border-top: 1px solid ${palette.brand.pastel};
    position: sticky;
    bottom: 0;
    padding: 12px;
    background: rgba(4, 31, 74, 0.8);
    z-index: 100;
`;

const topButtonContainerStyles = css`
    margin-left: ${-smallSpace}px;
    margin-right: ${-smallSpace}px;

    ${mobileLandscape} {
        margin-left: ${-mediumSpace}px;
        margin-right: ${-mediumSpace}px;
        padding: 12px ${mediumSpace}px;
    }
`;

const buttonStyles = css`
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    text-decoration: none;
    font-size: 16px;
    line-height: 22px;
    font-family: 'Guardian Text Sans Web', Helvetica Neue, Helvetica, Arial,
        Lucida Grande, sans-serif;
    font-weight: 700;
    box-sizing: border-box;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: ${transitions.medium};
    &:focus {
        ${focusHalo};
        outline: none;
    }
    &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
    }
    height: ${size.large}px;
    min-height: ${size.large}px;
    padding: 0 ${size.small / 2}px;
    ${mobileMedium} {
        padding: 0 ${size.medium / 2}px;
    }
    ${mobileLandscape} {
        padding: 0 ${size.large / 2}px;
    }
    border-radius: ${size.large / 2}px;
    svg {
        flex: 0 0 auto;
        display: block;
        fill: currentColor;
        position: relative;
        width: ${size.large}px;
        height: auto;
        margin: 0 ${-size.large / 3}px 0 ${size.large / 16}px;
    }
`;

const yellowButtonStyles = css`
    background-color: ${palette.yellow.main};
    color: ${palette.neutral[7]};

    &:hover :not(:disabled) {
        background-color: ${palette.yellow.dark};
    }
`;

const blueButtonStyles = css`
    background-color: ${palette.brand.dark};
    color: ${palette.neutral[100]};
    border: 1px solid ${palette.neutral[100]};
    margin-right: 8px;
    ${mobileLandscape} {
        margin-right: 12px;
    }
    &:hover :not(:disabled) {
        background-color: ${palette.sport.bright};
    }
`;

const bottomButtonContainerStyles = css`
    padding: ${smallSpace / 2}px ${smallSpace}px ${smallSpace}px ${smallSpace}px;
    margin-bottom: 12px;
    ${mobileLandscape} {
        padding: ${smallSpace / 2}px ${mediumSpace}px ${smallSpace}px
            ${mediumSpace}px;
    }
    p {
        font-size: 15px;
        line-height: 20px;
        font-family: 'Guardian Text Egyptian Web', Georgia, serif;
        font-weight: 700;
    }
`;

const validationErrorStyles = css`
    display: block;
    background-color: ${palette.news.bright};
    padding: ${smallSpace / 2}px ${smallSpace}px;
    ${mobileLandscape} {
        padding: ${mediumSpace / 2}px ${mediumSpace}px;
    }
    position: absolute;
    left: 0;
    right: 0;
    bottom: 100%;
    display: block;
    p {
        font-size: 15px;
        line-height: 20px;
        font-family: 'Guardian Text Egyptian Web', Georgia, serif;
        font-weight: 700;
        margin: 0;
    }
`;

interface State {
    iabPurposes: IabPurposeState;
    iabNullResponses?: number[];
}
interface Props {
    toggleCmpVisibility: () => void;
}

export class ConsentPreferencesDashboard extends Component<Props, State> {
    private iabVendorList?: ParsedIabVendorList;

    constructor(props: Props) {
        super(props);

        this.state = { iabPurposes: {} };
    }

    public componentDidMount(): void {
        fetch(IAB_VENDOR_LIST_URL)
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error(`${response.status} | ${response.statusText}`);
            })
            .then(remoteVendorList => {
                return this.buildState(parseIabVendorList(remoteVendorList));
            })
            .then(() => {
                const { toggleCmpVisibility } = this.props;

                toggleCmpVisibility();
            })
            .catch(error => {
                // TODO: ERROR HANDLING
                // eslint-disable-next-line no-console
                console.log('Error', error);
            });
    }

    public render(): React.ReactNode {
        const iabPurposesList = this.renderIabPurposeItems() as React.ReactNodeArray;
        const firstIabPurposeList = iabPurposesList.slice(0, 3);
        const secondIabPurposeList = iabPurposesList.slice(3);
        const { iabNullResponses } = this.state;

        return (
            <>
                <img
                    src="https://manage.theguardian.com/static/images/consent-graphic.png"
                    css={css`
                        width: 100%;
                    `}
                />
                <form css={formStyles}>
                    <h1>
                        Please review and manage your data and privacy settings
                        below.
                    </h1>
                    <p>
                        When you visit this site, we&apos;d like to use cookies
                        and identifiers to understand things like which pages
                        you&apos;ve visited and how long you&apos;ve spent with
                        us. It helps us improve our service to you.{' '}
                    </p>
                    <p>
                        Our advertising partners would like to do the same – so
                        the adverts are more relevant, and we make more money to
                        invest in Guardian journalism. By using this site, you
                        agree to our{' '}
                        <a
                            href={privacyPolicyURL}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            privacy
                        </a>{' '}
                        and{' '}
                        <a
                            href={cookiePolicyURL}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            cookie
                        </a>{' '}
                        policies
                    </p>
                    <div
                        css={css`
                            ${buttonContainerStyles};
                            ${topButtonContainerStyles};
                        `}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                scrollToPurposes();
                            }}
                            css={css`
                                ${buttonStyles};
                                ${blueButtonStyles};
                            `}
                        >
                            Options
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                this.enableAllAndClose();
                            }}
                            css={css`
                                ${buttonStyles};
                                ${yellowButtonStyles};
                            `}
                        >
                            Enable all and close
                            <ArrowIcon />
                        </button>
                    </div>
                    <div css={purposesContainerStyles} id={PURPOSES_ID}>
                        <ul css={cmpListStyles}>{firstIabPurposeList}</ul>
                        {/*
                            renderIabPurposeItems,
                            renderVendorItems and renderFeatureItems
                            should be in single <ul> once renderGuPurposeItems
                            is restored.
                        */}
                        <div>
                            <ul css={cmpListStyles}>{secondIabPurposeList}</ul>
                            {this.iabVendorList && (
                                <Vendors vendors={this.iabVendorList.vendors} />
                            )}
                            {this.iabVendorList && (
                                <Features
                                    features={this.iabVendorList.features}
                                />
                            )}
                            <div
                                css={css`
                                    ${buttonContainerStyles};
                                    ${bottomButtonContainerStyles};
                                `}
                            >
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
                                    browser at any time by accessing our{' '}
                                    <a
                                        href={privacyPolicyURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        privacy policy
                                    </a>
                                    .
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        this.close();
                                    }}
                                    css={css`
                                        ${buttonStyles};
                                        ${blueButtonStyles};
                                    `}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        this.saveAndClose();
                                    }}
                                    css={css`
                                        ${buttonStyles};
                                        ${yellowButtonStyles};
                                    `}
                                >
                                    <span>Save and continue</span>
                                    <ArrowIcon />
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </>
        );
    }

    private buildState(iabVendorList: ParsedIabVendorList): Promise<void> {
        this.iabVendorList = iabVendorList;
        const iabStr = readIabCookie();
        let iabPurposes = {};

        if (iabStr) {
            const iabData = new ConsentString(iabStr);
            iabPurposes = iabVendorList.purposes.reduce((acc, purpose) => {
                return {
                    ...acc,
                    [purpose.id]: iabData.isPurposeAllowed(purpose.id),
                };
            }, {});
        } else {
            iabPurposes = iabVendorList.purposes.reduce((acc, purpose) => {
                return { ...acc, [purpose.id]: null };
            }, {});
        }

        return new Promise(resolve =>
            this.setState({ iabPurposes }, () => resolve()),
        );
    }

    private renderIabPurposeItems(): React.ReactNode {
        if (!this.iabVendorList || !this.iabVendorList.purposes) {
            return '';
        }

        return this.iabVendorList.purposes.map(
            (purpose: IabPurpose): React.ReactNode => {
                const { id, name, description } = purpose;
                const { iabPurposes, iabNullResponses } = this.state;

                return (
                    <CmpListItem
                        name={name}
                        value={iabPurposes[id]}
                        updateItem={(updatedValue: boolean) => {
                            this.updateIabPurpose(id, updatedValue);
                        }}
                        key={`purpose-${id}`}
                        showError={
                            iabNullResponses && iabNullResponses.includes(id)
                        }
                    >
                        <p>{description}</p>
                    </CmpListItem>
                );
            },
        );
    }

    private updateIabPurpose(purposeId: number, value: boolean): void {
        this.setState(prevState => ({
            iabPurposes: {
                ...prevState.iabPurposes,
                [purposeId]: value,
            },
            iabNullResponses: prevState.iabNullResponses
                ? prevState.iabNullResponses.filter(
                      iabNullResponse => iabNullResponse !== purposeId,
                  )
                : [],
        }));
    }

    private enableAllAndClose(): void {
        const iabPurposes = Object.keys(this.state.iabPurposes).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {},
        );

        this.saveAndClose({ iabPurposes });
    }

    private saveAndClose(stateToSave?: State): void {
        if (this.saveSettings(stateToSave || this.state)) {
            this.close();
        }
    }

    private saveSettings(stateToSave: State): boolean {
        if (!this.iabVendorList) {
            return false;
        }

        const iabNullResponses: number[] = Object.keys(stateToSave.iabPurposes)
            .filter(key => stateToSave.iabPurposes[parseInt(key, 10)] === null)
            .map(key => parseInt(key, 10));

        if (iabNullResponses.length > 0) {
            this.setState({
                iabNullResponses,
            });

            return false;
        }

        const allowedPurposes = Object.keys(stateToSave.iabPurposes)
            .filter(key => stateToSave.iabPurposes[parseInt(key, 10)])
            .map(purpose => parseInt(purpose, 10));

        const allowedVendors = this.iabVendorList.vendors.map(
            vendor => vendor.id,
        );

        save(this.iabVendorList, allowedPurposes, allowedVendors);

        return true;
    }

    private close = () => {
        const { toggleCmpVisibility } = this.props;

        toggleCmpVisibility();
    };
}

const parseIabVendorList = (
    iabVendorList: IabVendorList,
): ParsedIabVendorList => {
    const vendors = iabVendorList.vendors.map(vendor => ({
        ...vendor,
        description: getVendorDescription(vendor, iabVendorList),
    }));

    return {
        ...iabVendorList,
        vendors,
    };
};

const getVendorDescription = (
    vendor: IabVendor,
    iabVendorList: IabVendorList,
): React.ReactNode => {
    const {
        name,
        policyUrl,
        purposeIds,
        legIntPurposeIds,
        featureIds,
    } = vendor;

    return (
        <>
            <p>
                <a href={policyUrl} target="_blank" rel="noopener noreferrer">
                    {name}&apos;s Privacy policy
                </a>
            </p>
            <p>
                Consent purpose(s):{' '}
                {getIabPurposesDescriptions(purposeIds, iabVendorList.purposes)}
            </p>
            <p>
                Legitimate interest purpose(s):{' '}
                {getIabPurposesDescriptions(
                    legIntPurposeIds,
                    iabVendorList.purposes,
                )}
            </p>
            <p>
                Feature(s):{' '}
                {getFeaturesDescriptions(featureIds, iabVendorList.features)}
            </p>
        </>
    );
};

const getIabPurposesDescriptions = (
    ids: number[],
    purposes: IabPurpose[],
): string => {
    const result = ids
        .reduce((acc, id) => {
            let str = '';

            const purpose = purposes.find(item => item.id === id);
            str = purpose ? purpose.name : '';

            return str.length ? `${acc}${str} | ` : acc;
        }, '')
        .slice(0, -3);

    return result.length ? result : 'None';
};

const getFeaturesDescriptions = (
    ids: number[],
    features: IabFeature[],
): string => {
    const result = ids
        .reduce((acc, id) => {
            let str = '';

            const feature = features.find(item => item.id === id);
            str = feature ? feature.name : '';

            return str.length ? `${acc}${str} | ` : acc;
        }, '')
        .slice(0, -3);

    return result.length ? result : 'None';
};

const scrollToPurposes = (): void => {
    // const purposeElem: HTMLElement | null = document.getElementById(
    //     PURPOSES_ID,
    // );
    // const scrollableElem: HTMLElement | null = document.getElementById(
    //     SCROLLABLE_ID,
    // );
    // const containerElem: HTMLElement | null = document.getElementById(
    //     CONTAINER_ID,
    // );
    // if (!purposeElem || !scrollableElem || !containerElem) {
    //     return;
    // }
    // const purposeElemOffsetTop = purposeElem.offsetTop;
    // const scrollableElemOffsetTop = scrollableElem.offsetTop;
    // const containerElemOffsetTop = containerElem.offsetTop;
    // // scrollTop can return subpixel on hidpi resolutions so round up to integer
    // const initDistanceScrolled = Math.ceil(scrollableElem.scrollTop);
    // const scrollLength =
    //     purposeElemOffsetTop -
    //     scrollableElemOffsetTop -
    //     containerElemOffsetTop -
    //     initDistanceScrolled;
    // const duration: number = 750;
    // const startTime: number =
    //     'now' in window.performance ? performance.now() : new Date().getTime();
    // const scroll = (): void => {
    //     const now: number =
    //         'now' in window.performance
    //             ? performance.now()
    //             : new Date().getTime();
    //     const time: number = Math.min(1, (now - startTime) / duration);
    //     const easing: number =
    //         time < 0.5
    //             ? 4 * time * time * time
    //             : (time - 1) * (2 * time - 2) * (2 * time - 2) + 1; // easeInOutCubic
    //     const newScrollTop =
    //         Math.ceil(easing * scrollLength) + initDistanceScrolled;
    //     // tslint:disable-next-line: no-object-mutation
    //     scrollableElem.scrollTop = newScrollTop;
    //     // scrollTop can return subpixel on hidpi resolutions so round up to integer
    //     const intScrollTop = Math.ceil(scrollableElem.scrollTop);
    //     if (
    //         intScrollTop === scrollLength + initDistanceScrolled ||
    //         newScrollTop !== intScrollTop
    //     ) {
    //         return;
    //     }
    //     requestAnimationFrame(scroll);
    // };
    // if ('requestAnimationFrame' in window === false) {
    //     // tslint:disable-next-line: no-object-mutation
    //     scrollableElem.scrollTop = scrollLength;
    //     return;
    // }
    // scroll();
};
