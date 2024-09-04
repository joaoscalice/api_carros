var express = require('express');
var path = require('path');
var rotaIndex = require('./routes/index');
var app = express();
var { sequelize, User } = require('./database'); 

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', rotaIndex);

async function criarAdminPadrao() {
  const adminExistente = await User.findOne({ where: { admin: true } });

  if (!adminExistente) {
    const bcrypt = require('bcryptjs');
    const senhaHash = await bcrypt.hash('admin123', 10);
    
    await User.create({
      usuario: 'admin',
      senha: senhaHash,
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
