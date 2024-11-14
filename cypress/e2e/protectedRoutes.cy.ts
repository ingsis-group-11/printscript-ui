import * as cypress from "cypress";
import {AUTH0_USERNAME,AUTH0_PASSWORD, FRONTEND_URL} from "../../src/utils/constants";

describe('Protected routes test', () => {
  it('should redirect to login when accessing a protected route unauthenticated', () => {
    cy.visit("https://printscript-prod.brazilsouth.cloudapp.azure.com" + "/rules");

    cy.origin(Cypress.env('VITE_AUTH0_DOMAIN'), () => {
      cy.url().should('include', '/login');
    });
  });

  it('should display login content', () => {
    cy.visit("https://printscript-prod.brazilsouth.cloudapp.azure.com");
    cy.wait(2000)

    cy.origin(Cypress.env('VITE_AUTH0_DOMAIN'), () => {
      cy.contains('Log in').should('exist');
      cy.contains('Password').should('exist'); 
    });
  });

  it('should not redirect to login when the user is already authenticated', () => {
    cy.loginToAuth0(
      Cypress.env("AUTH0_USERNAME"),
      Cypress.env("AUTH0_PASSWORD")
    )

    cy.visit("https://printscript-prod.brazilsouth.cloudapp.azure.com");

    cy.wait(10000)

    // Check if the URL is redirected to the login page
    cy.url().should('not.include', '/login');
  });

})
