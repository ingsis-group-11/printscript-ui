import { defineConfig } from "cypress";
import dotenv from 'dotenv'
import {FRONTEND_URL} from "./src/utils/constants";
dotenv.config()

export default defineConfig({
  e2e: {
    setupNodeEvents(_, config) {
      config.env = process.env
      return config
    },
    experimentalStudio: true,
    baseUrl: FRONTEND_URL,
    env: {
      AUTH0_USERNAME: 'mbarreiro@mail.austral.edu.ar',
      AUTH0_PASSWORD: 'Astor2024$',
      VITE_AUTH0_DOMAIN: 'https://dev-zljhtjva3ftqlrz7.us.auth0.com',
      AUTH0_CLIENT_ID: '0iZoTXdEtVcwJGDVKwwHkCV6hVEEHUmu',
    },
  },
});
