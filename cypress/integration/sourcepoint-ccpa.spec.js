/* eslint-disable no-undef */

import 'cypress-wait-until';

const iframeMessage = '#sp_message_iframe_208530';
const iframePrivacyManager = '#sp_privacy_manager_iframe';
const loadPage = () => {
	it('should load the CCPA page', () => cy.visit('/#ccpa'));
};
const doNotSellIs = (boolean) => {
	cy.get('[data-donotsell]')
		.should('have.data', 'donotsell')
		.should('equal', boolean);
};

const ccpaRejectCookieIs = (boolean) => {
	cy.waitUntil(() =>
		cy
			.getCookie('ccpaReject')
			.then((cookie) => Boolean(cookie && cookie.value)),
	);

	cy.getCookie('ccpaReject')
		.should('exist')
		.should('have.property', 'value', boolean.toString());
};

describe('Window', () => {
	loadPage();
	it('has the guCmpHotFix object', () => {
		cy.window().should('have.property', 'guCmpHotFix');
	});
	it('has correct config params', () => {
		cy.window()
			.its('_sp_ccpa.config')
			.then((spConfig) => {
				expect(spConfig.accountId).equal(1257);
				expect(spConfig.mmsDomain).equal('https://sourcepoint.theguardian.com');
				expect(spConfig.ccpaOrigin).equal('https://ccpa-service.sp-prod.net');
			});
	});
});

describe('Document', () => {
	loadPage();
	it('should have the SP iframe', () => {
		cy.get('iframe').should('be.visible').get(iframeMessage);
	});

	it('should have the correct script URL', () => {
		cy.get('script#sourcepoint-ccpa-lib').should(
			'have.attr',
			'src',
			'https://sourcepoint.theguardian.com/ccpa.js',
		);
	});
});

describe('Interaction', () => {
	loadPage();
	const buttonTitle = 'Do not sell my personal information';

	beforeEach(() => {
		cy.setCookie('ccpaApplies', 'true');
		Cypress.Cookies.preserveOnce(
			'ccpaUUID',
			'ccpaReject',
			'ccpaConsentAll',
			'consentStatus',
		);
	});

	it('should have DNS set to false by default', () => {
		doNotSellIs(false);
	});

	// TODO: fix this bug!
	// currently `onConsentChange` is not called when clicking the button
	it(`should retract consent when clicking "${buttonTitle}"`, () => {
		cy.getIframeBody(iframeMessage)
			.find(`button[title="${buttonTitle}"]`)
			.click();

		// the settings are only registered on the next page load
		ccpaRejectCookieIs(true);
		doNotSellIs(false);
		// cy.reload();
		// doNotSellIs(true);
	});

	// TODO: clicking "save and exit" does not actually save,
	// but does dismiss the PM
	it(`should be able to retract consent`, () => {
		cy.get('[data-cy=pm]').click();

		cy.getIframeBody(iframePrivacyManager)
			.find(`#tab-pan_5ed10cdb1ea0b9455a0ff81c div.right`) /* ¯\_(ツ)_/¯ */
			.click();

		cy.getIframeBody(iframePrivacyManager)
			.find('#tab-saveandexit')
			.should('be.visible')
			.click();

		ccpaRejectCookieIs(true);
		// doNotSellIs(true);
	});
});
