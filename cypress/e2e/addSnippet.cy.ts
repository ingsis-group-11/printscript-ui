import {AUTH0_PASSWORD, AUTH0_USERNAME, BACKEND_URL} from "../../src/utils/constants";
import { interceptFormData } from "cypress-intercept-formdata";

describe('Add snippet tests', () => {
  beforeEach(() => {
    cy.loginToAuth0(
      Cypress.env("AUTH0_USERNAME"),
      Cypress.env("AUTH0_PASSWORD")
    )
  })
  it('Can add snippets manually', () => {
    cy.visit("http://localhost:5173")
    cy.wait(5000)
    cy.intercept('PUT', "http://localhost:8000/api/snippet", (req) => {
      const formData = interceptFormData(req);
  
      expect(formData["name"]).to.eq("Some snippet name");
      expect(formData["language"]).to.eq("PrintScript 1.1");
      expect(formData["content"]).to.exist;
      expect(formData["extension"]).to.eq("prs");

      req.reply((res) => {
        expect(res.statusCode).to.eq(200);
      });
    }).as('postRequest');

    /* ==== Generated with Cypress Studio ==== */
    cy.get('.css-9jay18 > .MuiButton-root').click();
    cy.get('.MuiList-root > [tabindex="0"]').click();
    cy.get('#name').type('Some snippet name');
    cy.get('#demo-simple-select').click()
    cy.get('[data-testid="menu-option-PrintScript 1.1"]').click()

    cy.get('[data-testid="add-snippet-code-editor"]').click();
    cy.get('[data-testid="add-snippet-code-editor"]').type(`let snippet: string = "some snippet"; \n println(snippet);`);
    cy.get('[data-testid="SaveIcon"]').click();

    cy.wait('@postRequest').its('response.statusCode').should('eq', 200);
  })

  it('Can add snippets via file', () => {
    cy.visit("http://localhost:5173")
    cy.wait(5000)
    cy.intercept('PUT', "http://localhost:8000/api/snippet", (req) => {
      const formData = interceptFormData(req);
  
      expect(formData["name"]).to.eq("example_ps");
      expect(formData["language"]).to.eq("PrintScript 1.1");
      expect(formData["content"]).to.exist;
      expect(formData["extension"]).to.eq("prs");
      
      req.reply((res) => {
        expect(res.statusCode).to.eq(200);
      });
    }).as('postRequest');

    /* ==== Generated with Cypress Studio ==== */
    cy.get('[data-testid="upload-file-input"').selectFile("cypress/fixtures/example_ps.prs", {force: true})

    cy.get('[data-testid="SaveIcon"]').click();

    cy.wait('@postRequest').its('response.statusCode').should('eq', 200);
  })
})
