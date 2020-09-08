/* eslint-disable no-undef */

beforeEach(() => {
	cy.visit('');
});

describe('Window', () => {
	it('has the guCmpHotFix object', () => {
		cy.window().should('have.property', 'guCmpHotFix');
	});
	it('has correct config params', () => {
		cy.window()
			.its('_sp_.config')
			.then((spConfig) => {
				expect(spConfig.accountId).equal(1257);
				expect(spConfig.mmsDomain).equal('https://consent.theguardian.com');
			});
	});
});

describe('Document', () => {
	it('should have the SP iframe', () => {
		cy.get('iframe')
			.should('be.visible')
			.should('have.id', 'sp_message_iframe_208529');
	});

	it('should have the correct script URL', () => {
		cy.get('script#sourcepoint-tcfv2-lib').should(
			'have.attr',
			'src',
			'https://gdpr-tcfv2.sp-prod.net/wrapperMessagingWithoutDetection.js',
		);
	});
});
