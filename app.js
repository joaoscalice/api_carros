var express = require('express');
var path = require('path');
var rotaIndex = require('./routes/index');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json');
var app = express();
var { sequelize, User } = require('./database'); 

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use('/api', rotaIndex);

async function criarAdminPadrao() {
  const adminExistente = await User.findOne({ where: { admin: true } });

  if (!adminExistente) {
    await User.create({
      usuario: 'admin',
      senha: 'admin123',
      admin: true
    });

    console.log('Administrador padrão criado: admin/admin123');
  }
}

sequelize.sync().then(() => {
  criarAdminPadrao();
}).catch(err => {
  console.error('Erro ao sincronizar o banco de dados:', err);
});

module.exports = app;
