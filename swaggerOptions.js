const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Taskmanager',
      version: '1.0.0',
      description: 'Documentación de los endpoints del taskmanager',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://taskmanager-8orr.onrender.com',
        description: 'Servidor de producción'
      }
    ]
  },
  apis: ['./src/routes/*.js'], // Rutas de tus archivos con anotaciones Swagger
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
module.exports = swaggerDocs;