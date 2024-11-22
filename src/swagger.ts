import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const PORT = process.env.PORT || 3000;

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation For C3I',
      version: '1.0.0',
      description: 'API Information',
      contact: {
        name: 'Developer',
      },
      servers: [`http://localhost:${PORT}`],
    },
    servers: [
      {
        url: "/v1", // This will automatically prefix /v1 to all paths
      },
      {
        url: "/v1", // This will automatically prefix /v1 to all paths
      },
    ],
  },
  apis: ['./src/Routes/**/*.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};