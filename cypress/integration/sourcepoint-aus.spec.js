import 'cypress-wait-until';
import { ACCOUNT_ID, ENDPOINT } from '../../src/lib/sourcepointConfig';
import { loadPage } from '../utils';

const iframeMessage = `[id^="sp_message_iframe_"]`;
const iframePrivacyManager = '#sp_privacy_manager_iframe';
const url = '/#aus';

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
			.its('_sp_ccpa.config')
			.then((spConfig) => {
				expect(spConfig.accountId).equal(ACCOUNT_ID);
				expect(spConfig.baseEndpoint).equal(ENDPOINT);
			});
	});
});

describe('Document', () => {
	loadPage(url);
	// The banner/message iframe only appears in Australia (including VPN)
	// TODO: check scenarios on Sourcepoint config
	it('should have the Sourcepoint iframe', () => {
		cy.get('iframe').should('be.visible').get(iframeMessage);
	});

	it('should have the correct script URL', () => {
		cy.get('script#sourcepoint-aus-lib').should(
			'have.attr',
			'src',
			`${ENDPOINT}/ccpa.js`,
		);
	});
});

describe('Interaction', () => {
	loadPage(url);
	// const buttonTitle = 'Do not sell my personal information';

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

		// ccpaRejectCookieIs(true);
		personalisedAdvertisingIs(true);
	});
});
