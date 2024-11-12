

export function loginViaAuth0Ui(username: string, password: string) {
  // App landing page redirects to Auth0.
  cy.visit('http://localhost:5173/')

  cy.intercept('POST', "https://" + Cypress.env("VITE_AUTH0_DOMAIN") + "/oauth/token", (req) => {
    const auth0ClientHeader = req.headers['auth0-client'];
    cy.window().then((win) => {
      win.localStorage.setItem('authAccessToken', String(auth0ClientHeader))
  });
  }).as('login');

  cy.origin(
      Cypress.env('VITE_AUTH0_DOMAIN'),
      { args: { username, password } },
      ({ username, password }) => {
        cy.get('input#username').type(username)
        cy.get('input#password').type(password, { log: false })
        cy.contains('button[value=default]', 'Continue').click()
      }
  )


  // Ensure Auth0 has redirected us back to the RWA.
  cy.url().should('equal', 'http://localhost:5173/')
}




