describe('CMP integration', () => {
    it('Adds the required JS to the page', () => {
        cy.visit('http://localhost:10001');
        cy.get('#sourcepoint-stub');
        cy.get('#sourcepoint-lib');
        cy.get('iframe[src^="https://notice.sp-prod.net"]');
    });
});
