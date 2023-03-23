export const loadPage = (url) => {
	it(`should load the page: ${url}`, () => {
		cy.clearLocalStorage();

		cy.clearAllCookies();

		cy.visit(url);
	});
};
