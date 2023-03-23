import 'cypress-wait-until';
import {
	ENDPOINT,
	PRIVACY_MANAGER_CCPA,
} from '../../src/lib/sourcepointConfig';
import { loadPage } from '../utils';

const iframeMessage = `[id^="sp_message_iframe_"]`;
const iframePrivacyManager = `#sp_message_iframe_${PRIVACY_MANAGER_CCPA}`;

// TODO add checkbox in UI, default to production
const url = `/#ccpa`;

const doNotSellIs = (boolean) => {
	cy.get('[data-donotsell]').should(
		'have.attr',
		'data-donotsell',
		boolean.toString(),
	);
};

describe('Window', () => {
	beforeEach(() => {
		cy.visit(url);
	});
	it('has the guCmpHotFix object', () => {
		cy.window().should('have.property', 'guCmpHotFix');
	});
	it('has correct config params', () => {
		cy.window()
			.its('_sp_.config')
			.then((spConfig) => {
				expect(spConfig.accountId).equal(1257);
				expect(spConfig.baseEndpoint).equal(ENDPOINT);
			});
	});
});

describe('Document', () => {
	beforeEach(() => {
		cy.visit(url);
	});
	it('should have the SP iframe', () => {
		cy.get('iframe').should('be.visible').get(iframeMessage);
	});
	it('should have the correct script URL', () => {
		cy.get('script#sourcepoint-lib').should(
			'have.attr',
			'src',
			ENDPOINT + '/unified/wrapperMessagingWithoutDetection.js',
		);
	});
});

describe('Interaction', () => {
	beforeEach(() => {
		cy.visit(url);
	});
	const buttonTitle = 'Do not sell my personal information';

	it('should have DNS set to false by default', () => {
		doNotSellIs(false);
	});

	it(`should retract consent when clicking "${buttonTitle}"`, () => {
		cy.getIframeBody(iframeMessage)
			.find(`button[title="${buttonTitle}"]`)
			.click();

		doNotSellIs(true);
	});

	it(`should be able to retract consent`, () => {
		cy.get('[data-cy=pm]').click();

		cy.getIframeBody(iframePrivacyManager).find('.pm-toggle .off').click();

		cy.getIframeBody(iframePrivacyManager)
			.find('.sp_choice_type_SAVE_AND_EXIT')
			.should('be.visible')
			.click();

		doNotSellIs(true);
	});
});
