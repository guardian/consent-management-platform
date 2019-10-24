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

interface ParsedIabVendorList extends IabVendorList {
    vendors: ParsedIabVendor[];
}

interface ParsedIabVendor extends IabVendor {
    description: React.ReactNode;
}

interface State {
    iabPurposes: IabPurposeState;
}
interface Props {
    toggleCmpVisibility: () => void;
}

export class ConsentPreferencesDashboard extends Component<Props, State> {
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
                </form>
            </>
        );
    }

    private buildState(iabVendorList: ParsedIabVendorList): Promise<void> {
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
