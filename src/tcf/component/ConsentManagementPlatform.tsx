import 'whatwg-fetch';
import React, { Component } from 'react';
import { FontsContext } from './FontsContext';
import { DEFAULT_FONT_FAMILIES } from './utils/config';
import {
    GuPurposeList,
    IabFeature,
    IabPurpose,
    IabPurposeState,
    IabVendor,
    IabVendorList,
    FontsContextInterface,
    ParsedIabVendorList,
} from '../types';
import {
    setSource,
    setVariant,
    getVendorList,
    getGuPurposeList,
    setConsentState,
} from '../store';
import { Banner } from './Banner';
import { Modal } from './Modal';

window.performance?.mark('cmp-loaded');

const privacyPolicyUrl = 'https://www.theguardian.com/help/privacy-policy';
const cookiePolicyUrl = 'https://www.theguardian.com/info/cookies';
interface State {
    guPurposeList: GuPurposeList;
    parsedIabVendorList?: ParsedIabVendorList;
    mode: 'banner' | 'modal';
    focusVendors: boolean;
}

interface Props {
    onClose: () => void;
    source?: string;
    variant?: string;
    fontFamilies?: FontsContextInterface;
    forceModal?: boolean;
}

class ConsentManagementPlatform extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        const { forceModal } = props;

        this.state = {
            mode: forceModal ? 'modal' : 'banner',
            focusVendors: false,
            guPurposeList: getGuPurposeList(),
        };

        if (props.source) {
            setSource(props.source);
        }

        if (props.variant) {
            setVariant(props.variant);
        }
    }

    public componentDidMount(): void {
        const { onClose } = this.props;
        getVendorList().then(iabVendorList => {
            if (iabVendorList) {
                const parsedIabVendorList = parseIabVendorList(iabVendorList);

                this.setState({
                    parsedIabVendorList,
                });
            } else {
                onClose();
            }
        });
    }

    public render(): React.ReactNode {
        const { mode, focusVendors, parsedIabVendorList } = this.state;
        const { fontFamilies } = this.props;

        const bannerMode = mode === 'banner';

        return (
            <FontsContext.Provider
                value={fontFamilies || DEFAULT_FONT_FAMILIES}
            >
                {parsedIabVendorList && bannerMode && (
                    <Banner
                        privacyPolicyUrl={privacyPolicyUrl}
                        cookiePolicyUrl={cookiePolicyUrl}
                        iabPurposes={parsedIabVendorList.purposes}
                        onEnableAllAndCloseClick={() => {
                            this.enableAllAndClose();
                        }}
                        onOptionsClick={shouldFocusVendors =>
                            this.setState({
                                mode: 'modal',
                                focusVendors: shouldFocusVendors,
                            })
                        }
                        variant={this.props.variant}
                    />
                )}
                {parsedIabVendorList && !bannerMode && (
                    <Modal
                        focusVendors={focusVendors}
                        parsedVendorList={parsedIabVendorList}
                        onSaveAndCloseClick={(iabState: IabPurposeState) => {
                            this.saveAndCloseClick(iabState);
                        }}
                        onEnableAllAndCloseClick={() => {
                            this.enableAllAndClose();
                        }}
                        onCancelClick={() => {
                            const { forceModal, onClose } = this.props;

                            if (forceModal) {
                                onClose();
                            } else {
                                this.setState({
                                    mode: 'banner',
                                    focusVendors: false,
                                });
                            }
                        }}
                    />
                )}
            </FontsContext.Provider>
        );
    }

    private saveAndCloseClick(iabState: IabPurposeState): void {
        const { onClose } = this.props;
        const { guPurposeList } = this.state;

        /**
         * TODO: Once PECR  Purposes introduced to UI
         * remove this guPurposesAllEnable and use actual choices
         * made by user as we do with iabState.
         * */
        const guPurposesAllEnable = guPurposeList.purposes.reduce(
            (acc, guPurpose) => ({
                ...acc,
                [guPurpose.id]: true,
            }),
            {},
        );

        setConsentState(guPurposesAllEnable, iabState);

        onClose();
    }

    private enableAllAndClose(): void {
        const { onClose } = this.props;
        const { parsedIabVendorList, guPurposeList } = this.state;

        if (!parsedIabVendorList) {
            return;
        }

        const guPurposesAllEnable = guPurposeList.purposes.reduce(
            (acc, guPurpose) => ({ ...acc, [guPurpose.id]: true }),
            {},
        );

        const iabPurposesAllEnable = Object.keys(
            parsedIabVendorList.purposes,
        ).reduce((acc, key) => {
            const { id } = parsedIabVendorList.purposes[parseInt(key, 10)];

            return { ...acc, [id]: true };
        }, {});

        setConsentState(guPurposesAllEnable, iabPurposesAllEnable);

        onClose();
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

export { ConsentManagementPlatform };
