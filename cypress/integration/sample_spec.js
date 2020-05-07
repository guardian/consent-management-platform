describe('CMP integration', () => {
    it('Runs dev server', () => {
        cy.visit('http://localhost:10001');
    });
    it('Adds the sourcepoint stub to the page', () => {
        cy.get('#sourcepoint-stub');
    });

    describe('sourcepoint stub', () => {
        it('Is added to the page', () => {
            cy.get('#sourcepoint-stub');
        });

        it('Adds the config params', () => {
            // cy.window()
            //     .its('_sp_.config')
            //     .its('accountId')
            //     .should('equal', 1257);
            // cy.window()
            //     .its('_sp_.config.mmsDomain')
            //     .should('equal', 'https://message.sp-prod.net');
            // cy.window()
            //     .its('_sp_.config.wrapperAPIOrigin')
            //     .should('equal', 'https://wrapper-api.sp-prod.net/tcfv2');

            // const spConfig = cy.window().its('_sp_.config');

            cy.window()
                .its('_sp_.config')
                .then(spConfig => {
                    expect(spConfig.accountId).equal(1257);
                    expect(spConfig.mmsDomain)
                        // eslint-disable-next-line prettier/prettier
                        .equal('https://message.sp-prod.net');
                    expect(spConfig.wrapperAPIOrigin)
                        // eslint-disable-next-line prettier/prettier
                        .equal('https://wrapper-api.sp-prod.net/tcfv2');
                });
        });
    });

    describe('sourcepoint lib', () => {
        it('Is added to the page with the correct URL', () => {
            const url =
                'https://gdpr-tcfv2.sp-prod.net/wrapperMessagingWithoutDetection.js';
            cy.get('#sourcepoint-lib').should('have.attr', 'src', url);
        });

        it.skip('Gets sourcepoint script', () => {});
    });
});
