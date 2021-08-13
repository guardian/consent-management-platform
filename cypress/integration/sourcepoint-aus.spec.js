import 'cypress-wait-until';
import { ACCOUNT_ID, ENDPOINT } from '../../src/lib/sourcepointConfig';
import { loadPage } from '../utils';

const iframeMessage = `[id^="sp_message_iframe_"]`;
const iframePrivacyManager = '#sp_privacy_manager_iframe';

// TODO add checkbox in UI, default to production
const stage = true;
const env = stage ? 'stage' : 'public';
const url = `/?_sp_env=${env}#aus`;

const personalisedAdvertisingIs = (boolean) => {
	cy.get('[data-personalised-advertising]')
		.should('have.length', 1)
		.should('contain', boolean.toString());
};

describe('Window', () => {
	loadPage(url);
	it('has the guCmpHotFix object', () => {
		cy.window().should('have.property', 'guCmpHotFix');
	});
	it('has correct config params', () => {
		cy.window()
			.its('_sp_.config')
			.then((spConfig) => {
				expect(spConfig.accountId).equal(ACCOUNT_ID);
				expect(spConfig.baseEndpoint).equal(ENDPOINT);
			});
	});
});

describe('Document', () => {
	loadPage(url);

	it('should have the Sourcepoint iframe', () => {
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
	loadPage(url);

	// Cookies need to be kept for consent to be passed from one test to the next
	beforeEach(() => {
		cy.setCookie('ccpaApplies', 'true');
		Cypress.Cookies.preserveOnce(
			'ccpaUUID',
			'ccpaReject',
			'ccpaConsentAll',
			'consentStatus',
		);
	});

	it('should have personalised advertising set to true by default', () => {
		personalisedAdvertisingIs(true);
	});

	it('Should click continue to dismiss the banner', () => {
		cy.getIframeBody(iframeMessage)
			.find(`button[title="Continue"]`)
			.click();
	});

	it(`should be able to retract consent`, () => {
		cy.get('[data-cy=pm]').click();

		cy.getIframeBody(iframePrivacyManager)
			.find(
				`#tab-pan_5ff468ee2517312b60214b15 div.right`,
			) /* ¯\_(ツ)_/¯ */
			.click();

		cy.getIframeBody(iframePrivacyManager)
			.find('#tab-saveandexit')
			.should('be.visible')
			.click();

		personalisedAdvertisingIs(false);
	});
});
