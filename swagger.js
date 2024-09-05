const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    version: "1.0",
    title: 'API Carros - REST API',
    description: 'Documentação da API REST para manipulação de dados de carros',
  },
  host: 'localhost:3000',
  schemes: ['http'],
};

const outputFile = './swagger_output.json';
const endpointsFiles = ['./routes/index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('Documentação gerada com sucesso!');
});
