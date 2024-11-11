const { defineConfig } = require('cypress')

module.exports = defineConfig({
  env: {
    AUTH0_USERNAME: 'mbarreiro@mail.austral.edu.ar',
    AUTH0_PASSWORD: 'Astor2024$',
    AUTH0_DOMAIN: 'https://dev-zljhtjva3ftqlrz7.us.auth0.com',
    AUTH0_CLIENT_ID: '0iZoTXdEtVcwJGDVKwwHkCV6hVEEHUmu',
  },
})