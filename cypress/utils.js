export const loadPage = (url) => {
	it(`should load the page: ${url}`, () => {
		cy.visit(url);

		// undocumented fix for cookies from non-localhost domains
		// https://github.com/cypress-io/cypress/issues/408#issuecomment-643281127
		cy.clearCookies({ domain: null });
	});
};
