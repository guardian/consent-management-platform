/* eslint-disable no-undef */

import { skipOn } from '@cypress/skip-test';

const iframeMessage = `#sp_message_iframe_${343252}`;
const iframePrivacyManager = '#sp_message_iframe_106842';
const loadPage = () => {
	it('should load the TCFv2 page', () => cy.visit('/#tcfv2'));
};

describe('Window', () => {
	loadPage();
	it('has the guCmpHotFix object', () => {
		cy.window().should('have.property', 'guCmpHotFix');
	});
	it('has correct config params', () => {
		cy.window()
			.its('_sp_.config')
			.then((spConfig) => {
				expect(spConfig.accountId).equal(1257);
				expect(spConfig.baseEndpoint).equal(
					'https://sourcepoint.theguardian.com',
				);
			});
	});
});

describe('Document', () => {
	loadPage();
	it('should have the SP iframe', () => {
		cy.get('iframe').should('be.visible').get(iframeMessage);
	});

	it('should have the correct script URL', () => {
		cy.get('script#sourcepoint-tcfv2-lib').should(
			'have.attr',
			'src',
			'https://sourcepoint.theguardian.com/wrapperMessagingWithoutDetection.js',
		);
	});
});

// TODO: enable testing of TCFv2 on CI
skipOn(Cypress.env('CI') === 'true', () => {
	describe('Interaction', () => {
		loadPage();
		const buttonTitle = 'Yes, I’m happy';

		beforeEach(() => {
			cy.setCookie('ccpaApplies', 'false');
			cy.setCookie('gdprApplies', 'true');
			Cypress.Cookies.preserveOnce('consentUUID', 'euconsent-v2');
		});

		it(`should give all consents when clicking "${buttonTitle}"`, () => {
			cy.getIframeBody(iframeMessage)
				.find(`button[title="${buttonTitle}"]`)
				.click();

			// eslint-disable-next-line cypress/no-unnecessary-waiting
			cy.wait(1000);

			[(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)].forEach((purpose) => {
				cy.get(`[data-purpose="${purpose}"]`).should(
					'have.data',
					'consent',
					true,
				);
			});
		});
		it(`should be able to only deactivate purpose 1`, () => {
			cy.get('[data-cy=pm]').click();

			cy.getIframeBody(iframePrivacyManager)
				.find(
					`label[aria-label="Store and/or access information on a device"]`,
				)
				.find('span.off')
				.click();

			cy.getIframeBody(iframePrivacyManager)
				.find(`button[aria-label="Save and close"]`)
				.click();

			// eslint-disable-next-line cypress/no-unnecessary-waiting
			cy.wait(1000);

			cy.get(`[data-purpose="1"]`)
				.should('have.data', 'consent')
				.should('equal', false);

			[2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((purpose) => {
				cy.get(`[data-purpose="${purpose}"]`)
					.should('have.data', 'consent')
					.should('equal', true);
			});
		});

		it(`should be able to refuse all but purpose 1`, () => {
			cy.get('[data-cy=pm]').click();

			cy.getIframeBody(iframePrivacyManager)
				.find(
					`label[aria-label="Store and/or access information on a device"]`,
				)
				.find('span.on')
				.click();

			cy.getIframeBody(iframePrivacyManager)
				.find(`div.stack-toggles`)
				.click();

			cy.getIframeBody(iframePrivacyManager)
				.find(`button[aria-label="Save and close"]`)
				.click();

			// eslint-disable-next-line cypress/no-unnecessary-waiting
			cy.wait(1000);

			cy.get(`[data-purpose="1"]`)
				.should('have.data', 'consent')
				.should('equal', false);

			[2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((purpose) => {
				cy.get(`[data-purpose="${purpose}"]`)
					.should('have.data', 'consent')
					.should('equal', true);
			});
		});
	});
});
skipOn(Cypress.env('CI') !== 'true', () => {
	describe('Skipped in CI', () => {
		it('should skip TCFv2 in CI env, because of geolocation', () => true);
	});
});
