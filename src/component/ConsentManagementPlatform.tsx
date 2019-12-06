import React, { Component } from 'react';
// import { css } from '@emotion/core';
// import { mobileLandscape, palette, space } from '@guardian/src-foundations';
// import { Logo } from './svgs/Logo';
// import { ConsentPreferencesDashboard } from './ConsentPreferencesDashboard';
import { FontsContext } from './FontsContext';
import {
    // SCROLLABLE_ID,
    // CONTENT_ID,
    DEFAULT_FONT_FAMILIES,
} from './utils/config';
import {
    IabFeature,
    IabPurpose,
    // IabPurposeState,
    IabVendor,
    IabVendorList,
    FontsContextInterface,
    ParsedIabVendorList,
} from '../types';
import {
    setSource,
    setVariant,
    // getConsentState,
    // setConsentState,
    getVendorList,
    // getVariant,
} from '../store';
import { Banner } from './Banner';

interface State {
    parsedIabVendorList?: ParsedIabVendorList;
    mode: 'banner' | 'modal';
}

interface Props {
    onClose: () => void;
    source?: string;
    variant?: string;
    fontFamilies?: FontsContextInterface;
}
class ConsentManagementPlatform extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            mode: 'banner',
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
        getVendorList()
            .then(remoteVendorList => {
                const parsedIabVendorList = parseIabVendorList(
                    remoteVendorList,
                );

                this.setState({
                    parsedIabVendorList,
                });
            })
            .catch(onClose);
    }

    public render(): React.ReactNode {
        const { parsedIabVendorList } = this.state;
        const { fontFamilies } = this.props;
        // const { mode } = this.state;

        // const bannerMode = mode === 'banner';

        return (
            <FontsContext.Provider
                value={fontFamilies || DEFAULT_FONT_FAMILIES}
            >
                {parsedIabVendorList && (
                    <Banner
                        guPurposes={[]}
                        iabPurposes={parsedIabVendorList.purposes}
                        onSave={(guState, iabState) => {
                            console.log('Saved', guState, iabState);
                        }}
                        onOptionsClick={() => {
                            console.log('Options clicked');
                        }}
                    />
                )}
            </FontsContext.Provider>
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
