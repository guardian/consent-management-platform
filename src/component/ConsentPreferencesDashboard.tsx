import { css } from '@emotion/core';
import React, { Component } from 'react';
import { mobileLandscape, palette, space } from '@guardian/src-foundations';
import {
    IabFeature,
    IabPurpose,
    IabPurposeState,
    IabVendor,
    IabVendorList,
} from '../types';
import { IAB_VENDOR_LIST_URL } from '../config';
import { readIabCookie } from '../cookies';
import { ConsentString } from 'consent-string';
import { CmpListItem } from './CmpListItem';
import { Vendors } from './Vendors';
import { Features } from './Features';

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

interface ParsedIabVendorList extends IabVendorList {
    vendors: ParsedIabVendor[];
}

export interface ParsedIabVendor extends IabVendor {
    description: React.ReactNode;
}

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
                } else {
                    throw new Error(
                        `${response.status} | ${response.statusText}`,
                    );
                }
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
            });
    }

    public render(): React.ReactNode {
        const iabPurposesList = this.renderIabPurposeItems() as React.ReactNodeArray;
        const firstIabPurposeList = iabPurposesList.slice(0, 3);
        const secondIabPurposeList = iabPurposesList.slice(3);
        const { iabNullResponses } = this.state;

        console.log('***', firstIabPurposeList, secondIabPurposeList);

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
                        When you visit this site, we'd like to use cookies and
                        identifiers to understand things like which pages you've
                        visited and how long you've spent with us. It helps us
                        improve our service to you.{' '}
                    </p>
                    <p>
                        Our advertising partners would like to do the same – so
                        the adverts are more relevant, and we make more money to
                        invest in Guardian journalism. By using this site, you
                        agree to our{' '}
                        <a href={privacyPolicyURL} target="_blank">
                            privacy
                        </a>{' '}
                        and{' '}
                        <a href={cookiePolicyURL} target="_blank">
                            cookie
                        </a>{' '}
                        policies
                    </p>
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

        this.iabVendorList;

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
        this.setState((prevState, props) => ({
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
                <a href={policyUrl} target="_blank">
                    {name}'s Privacy policy
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

            if (str.length) {
                return acc + str + ' | ';
            } else {
                return acc;
            }
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

            if (str.length) {
                return acc + str + ' | ';
            } else {
                return acc;
            }
        }, '')
        .slice(0, -3);

    return result.length ? result : 'None';
};
