describe('CMP integration', () => {
    it('Runs dev server', () => {
        cy.visit('http://localhost:10001');
    });

    describe('sourcepoint stub', () => {
        it('Is added to the page', () => {
            cy.get('script#sourcepoint-stub');
        });

        it('Adds the config params', () => {
            cy.window()
                .its('_sp_.config')
                .then(spConfig => {
                    expect(spConfig.accountId).equal(1257);
                    expect(spConfig.mmsDomain).equal(
                        'https://message.sp-prod.net',
                    );
                    expect(spConfig.wrapperAPIOrigin).equal(
                        'https://wrapper-api.sp-prod.net/tcfv2',
                    );
                });
        });
    });

    describe('sourcepoint lib', () => {
        it('Is added to the page with the correct URL', () => {
            cy.get('script#sourcepoint-lib').should(
                'have.attr',
                'src',
                'https://gdpr-tcfv2.sp-prod.net/wrapperMessagingWithoutDetection.js',
            );
        });

        it.skip('Gets sourcepoint script', () => {
            // Cannot test right now due to library limitations
            // https://docs.cypress.io/api/commands/route.html#Syntax
            // Issue opened here: https://github.com/cypress-io/cypress/issues/95
        });
    });
});
