import swaggerJSDoc from "swagger-jsdoc";
import { env } from "./env";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "SmartLedger API",
      version: "1.0.0",
      description: "Invoice Generator SaaS backend for SmartLedger",
      contact: {
        name: "Philip Oyelegbin",
        url: "https://philipoyelegbin.com.ng",
        email: "info@philipoyelegbin.com.ng",
      },
    },
    servers: [
      { url: `http://localhost:${env.port}/api/v1`, description: "Local" },
      { url: "https://api.smartledger.app/api/v1", description: "Production" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts", "./src/entities/*.ts"],
});

export const swaggerUiOptions = {
  swaggerOptions: {
    docExpansion: "none",
    persistAuthorization: true,
    filter: true,
    tagsSorter: "alpha",
    operationsSorter: "alpha",
  },
};
