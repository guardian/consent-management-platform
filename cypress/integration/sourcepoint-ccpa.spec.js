/* eslint-disable no-undef */

const iframeMessage = '#sp_message_iframe_208530';
const iframePrivacyManager = '#sp_privacy_manager_iframe';
const loadPage = () => {
	it('should load the CCPA page', () => cy.visit('/#ccpa'));
};
const doNotTrackIs = (boolean) => {
	cy.get('li[data-dnt]').should('have.data', 'dnt').should('equal', boolean);
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
		Cypress.Cookies.preserveOnce(
			'ccpaUUID',
			'ccpaReject',
			'ccpaConsentAll',
			'consentStatus',
		);
	});

	it('should have DNT set to false by default', () => {
		doNotTrackIs(false);
	});

	// TODO: fix this bug!
	// currently `onConsentChange` is not called when clicking the button
	it.skip(`should retract consent when clicking "${buttonTitle}"`, () => {
		cy.getIframeBody(iframeMessage)
			.find(`button[title="${buttonTitle}"]`)
			.click();

		doNotTrackIs(true);
	});

	it(`should be able to retract consent`, () => {
		cy.get('[data-cy=pm]').click();

		cy.getIframeBody(iframePrivacyManager)
			.find(`#tab-pan_5ed10cdb1ea0b9455a0ff81c div.right`) /* ¯\_(ツ)_/¯ */
			.wait(600)
			.click();

		cy.getIframeBody(iframePrivacyManager)
			.find('#tab-saveandexit')
			.should('be.visible')
			.wait(1200)
			.click();

		doNotTrackIs(true);
	});

	it.skip(`should be able to refuse all but purpose 1`, () => {
		cy.get('[data-cy=pm]').click();

		cy.getIframeBody(iframePrivacyManager)
			.find(`label[aria-label="Store and/or access information on a device"]`)
			.find('span.on')
			.click();

		cy.getIframeBody(iframePrivacyManager).find(`div.stack-toggles`).click();

		cy.getIframeBody(iframePrivacyManager)
			.find(`button[aria-label="Save and close"]`)
			.click();

		cy.get(`li[data-purpose="1"]`)
			.should('have.data', 'consent')
			.should('equal', false);
		[2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((purpose) => {
			cy.get(`li[data-purpose="${purpose}"]`)
				.should('have.data', 'consent')
				.should('equal', true);
		});
	});
});
