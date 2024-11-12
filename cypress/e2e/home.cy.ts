import {AUTH0_PASSWORD, AUTH0_USERNAME, BACKEND_URL, FRONTEND_URL} from "../../src/utils/constants";
import {CreateSnippet} from "../../src/utils/snippet";
import { interceptFormData } from "cypress-intercept-formdata";

describe('Home', () => {
  beforeEach(() => {
    cy.loginToAuth0(
      Cypress.env("AUTH0_USERNAME"),
      Cypress.env("AUTH0_PASSWORD")
    )
  })
  it('Renders home', () => {
    cy.visit("http://localhost:5173")
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.MuiTypography-h6').should('have.text', 'Printscript');
    cy.get('.MuiBox-root > .MuiInputBase-root > .MuiInputBase-input').should('be.visible');
    cy.get('.css-9jay18 > .MuiButton-root').should('be.visible');
    cy.get('.css-jie5ja').click();
    /* ==== End Cypress Studio ==== */
  })

  // You need to have at least 1 snippet in your DB for this test to pass
  it('Renders the first snippets', () => {
    cy.visit("http://localhost:5173")
    const first10Snippets = cy.get('[data-testid="snippet-row"]')

    first10Snippets.should('have.length.greaterThan', 0)

    first10Snippets.should('have.length.lessThan', 11)
  })

  it('Can create snippet and find snippets by name', () => {
    cy.visit("http://localhost:5173")
    
    const snippetData = {
      name: "Snippet Test",
      content: "println(1);",
      language: "PrintScript 1.1",
      extension: "prs"
    }
  
    cy.intercept('GET', `http://localhost:8000/snippet`, (req) => {
      req.reply((res) => {
        expect(res.statusCode).to.eq(200);
      });
    }).as('getSnippets');
  
    // Interceptar la solicitud PUT y verificar el FormData
    cy.intercept('PUT', 'http://localhost:8000/api/snippet', (req) => {
      const formData = interceptFormData(req); // Función para interceptar FormData
  
      // Verificar los datos dentro de FormData
      expect(formData["name"]).to.eq(snippetData.name);
      expect(formData["language"]).to.eq(snippetData.language);
      expect(formData["content"]).to.exist;
      expect(formData["extension"]).to.eq(snippetData.extension);
  
      req.reply((res) => {
        expect(res.statusCode).to.eq(200); // Respuesta esperada
      });
    }).as('putRequest');
    
    // Recuperar el authToken desde localStorage
    const authToken = window.localStorage.getItem('authAccessToken');
    
    // Verificar si el authToken existe antes de continuar
    if (!authToken) {
      throw new Error("Auth token not found in localStorage");
    }
  
    // Crear el FormData
    const formData = new FormData();
    const fileBlob = new Blob([snippetData.content], { type: 'text/plain' });
    formData.append("content", fileBlob, `${snippetData.name}.${snippetData.extension}`);
    formData.append("name", snippetData.name);
    formData.append("language", snippetData.language);
    formData.append("extension", snippetData.extension);
  
    // Realizar la solicitud PUT con el token de localStorage y FormData
    cy.request({
      method: 'PUT',
      url: `http://localhost:8000/api/snippet`,
      body: formData,
      headers: {
        Authorization: `Bearer ${authToken}`
      },
      failOnStatusCode: false,
      encoding: 'binary'
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
  
  
  
})
