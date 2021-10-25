export const STAGE = 'prod';

export const loadPage = (url) => {
	it(`should load the page: ${url}`, () => {
		cy.clearLocalStorage();

		// undocumented fix for cookies from non-localhost domains
		// https://github.com/cypress-io/cypress/issues/408#issuecomment-643281127
		cy.clearCookies({ domain: null });

		cy.visit(url);
	});
};
