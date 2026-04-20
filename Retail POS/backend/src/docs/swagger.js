const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Retail POS Backend API',
      version: '1.0.0',
    },
  },
  apis: [],
};

const specs = swaggerJsDoc(options);

function setupSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));
}

module.exports = setupSwagger;
