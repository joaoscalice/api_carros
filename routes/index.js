var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
const { User } = require('../database');
var jwt = require('jsonwebtoken');
const verificarTokenAdmin = require('../middlewares/admin');

router.get("/", (req, res) => {
    res.json({status: true, msg: "Isso é um teste de API"})
})

router.post('/registrar', async (req, res) => {
    const { usuario, senha, admin } = req.body;
  
    try {
      const userExists = await User.findOne({ where: { usuario } });
  
      if (userExists) {
        return res.status(400).json({ error: 'Nome de usuário já em uso' });
      }
  
      const hashedPassword = await bcrypt.hash(senha, 10);
  
      const user = await User.create({
        usuario,
        senha: hashedPassword,
        admin: admin || false
      });
  
      res.status(201).json({ message: 'Usuário cadastrado com sucesso!', user });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao cadastrar usuário' });
    }
  });

  router.post('/admin/criar', verificarTokenAdmin, async (req, res) => {
    const { usuario, senha } = req.body;

    try {
        const userExists = await User.findOne({ where: { usuario } });

        if (userExists) {
            return res.status(400).json({ error: 'Nome de usuário já em uso' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const admin = await User.create({
            usuario,
            senha: hashedPassword,
            admin: true
        });

        res.status(201).json({ message: 'Administrador criado com sucesso!', admin });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao criar administrador' });
    }
});

router.delete('/admin/excluir/:id', verificarTokenAdmin, async (req, res) => {
  const userId = req.params.id;

  try {
      const user = await User.findByPk(userId);

      if (!user) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      if (user.admin) {
          return res.status(403).json({ error: 'Administradores não podem ser excluídos por esta rota' });
      }

      await user.destroy();
      res.status(200).json({ message: 'Usuário excluído com sucesso' });
  } catch (err) {
      res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
});

router.post('/login', async (req, res) => {
  const { usuario, senha } = req.body;

  try {
      const user = await User.findOne({ where: { usuario } });

      if (!user) {
          return res.status(400).json({ error: 'Usuário ou senha incorretos' });
      }

      const senhaValida = await bcrypt.compare(senha, user.senha);

      if (!senhaValida) {
          return res.status(400).json({ error: 'Usuário ou senha incorretos' });
      }

      const token = jwt.sign({ id: user.id, admin: user.admin }, 'abc123', { expiresIn: '1h' });

      res.status(200).json({ message: 'Autenticação bem-sucedida', token });
  } catch (err) {
      res.status(500).json({ error: 'Erro ao tentar fazer login' });
  }
});

module.exports = router;