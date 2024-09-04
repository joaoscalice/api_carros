var express = require('express');
var router = express.Router();
const { User } = require('../database');
var jwt = require('jsonwebtoken');
const verificarTokenAdmin = require('../middlewares/admin');
const verificarTokenUsuario = require('../middlewares/usuario');

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
  
      const user = await User.create({
        usuario,
        senha,
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

        const admin = await User.create({
            usuario,
            senha,
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

      if (!user || user.senha !== senha) {
          return res.status(400).json({ error: 'Usuário ou senha incorretos' });
      }

      const token = jwt.sign({ id: user.id, admin: user.admin }, 'abc123', { expiresIn: '1h' });

      res.status(200).json({ message: 'Autenticação bem-sucedida', token });
  } catch (err) {
      res.status(500).json({ error: 'Erro ao tentar fazer login' });
  }
});

router.put('/usuario/alterar/:id', verificarTokenUsuario, async (req, res) => {
  const { id } = req.params;
  const { usuario, senha } = req.body;

  try {
      const usuarioAlvo = await User.findByPk(id);

      if (!usuarioAlvo) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      if (req.user.id !== usuarioAlvo.id && !req.user.admin) {
          return res.status(403).json({ error: 'Você não tem permissão para alterar os dados deste usuário' });
      }

      usuarioAlvo.usuario = usuario || usuarioAlvo.usuario;
      usuarioAlvo.senha = senha || usuarioAlvo.senha;

      await usuarioAlvo.save();

      res.json({ message: 'Dados do usuário atualizados com sucesso', usuario: usuarioAlvo });
  } catch (err) {
      res.status(500).json({ error: 'Erro ao atualizar os dados do usuário' });
  }
});

module.exports = router;