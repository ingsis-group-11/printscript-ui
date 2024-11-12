import {AUTH0_PASSWORD, AUTH0_USERNAME, BACKEND_URL} from "../../src/utils/constants";

const snippet = {
  id: "1",
  name: "Test name",
  content: "println(1);",
  language: "PrintScript 1.1",
  extension: 'prs',
  compliance: 'SUCCESS',
}

describe('Add snippet tests', () => {
  beforeEach(() => {
    cy.loginToAuth0(
      Cypress.env("AUTH0_USERNAME"),
      Cypress.env("AUTH0_PASSWORD")
    )
    cy.intercept('GET', "http://localhost:8000/snippet", {
      statusCode: 200,
      body: snippet,
    }).as("getSnippetById")

    cy.intercept('GET', "http://localhost:8000/snippet", {
      statusCode: 200,
      body: {
        page: 1,
        page_size: 10,
        count: 10,
        snippets: [ snippet ]
      },
    }).as("getSnippets");

    cy.visit("/")
    cy.wait(5000)

    cy.get('.MuiTableBody-root > :nth-child(1) > :nth-child(1)').click();
  })

  it('Can share a snippet ', () => {
    cy.get('[aria-label="Share"]').click();
    cy.get('#\\:rj\\:').click();
    cy.get('#\\:rj\\:-option-1').click();
    cy.get('.css-1yuhvjn > .MuiBox-root > .MuiButton-contained').click();
    cy.wait(2000)
  })

  /*
  it('Can run snippets', function() {
    cy.get('[data-testid="PlayArrowIcon"]').click();
    cy.get('.css-1hpabnv > .MuiBox-root > div > .npm__react-simple-code-editor__textarea').should("have.length.greaterThan",0);
  });
  */

  it('Can format snippets', function() {
    cy.get('[data-testid="ReadMoreIcon"] > path').click();
  });

  it('Can save snippets', function() {
    cy.get('.css-10egq61 > .MuiBox-root > div > .npm__react-simple-code-editor__textarea').click();
    cy.get('.css-10egq61 > .MuiBox-root > div > .npm__react-simple-code-editor__textarea').type("println(1);");
    cy.get('[data-testid="SaveIcon"] > path').click();
  });

  it('Can delete snippets', function() {
    cy.get('[data-testid="DeleteIcon"] > path').click();
  });
})
