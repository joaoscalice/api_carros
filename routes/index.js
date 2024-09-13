var express = require('express');
var router = express.Router();
const { User } = require('../database');
const { Car } = require('../database');
var jwt = require('jsonwebtoken');
const verificarTokenAdmin = require('../middlewares/admin');
const verificarTokenUsuario = require('../middlewares/usuario');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
  });

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

router.post('/carros', verificarTokenUsuario, async (req, res) => {
    const { marca, ano, modelo } = req.body;

    if (!marca || !ano || !modelo || !valor) {
        return res.status(400).json({ error: 'Todos os campos (marca, ano, modelo, valor) são obrigatórios' });
    }

    try {
        const carro = await Car.create({
            marca,
            ano,
            modelo,
            valor,
            userId: req.user.id
        });
        res.status(201).json({ message: 'Carro cadastrado com sucesso', carro });
    } catch (err) { 
        res.status(500).json({ error: 'Erro ao cadastrar o carro', details: err.message });
    }
});

router.get('/carros', verificarTokenAdmin, async (req, res) => {
    let { limite = 5, pagina = 1 } = req.body;

    limite = parseInt(limite);
    if (![5, 10, 30].includes(limite)) {
        return res.status(400).json({ error: 'O limite deve ser 5, 10 ou 30' });
    }

    pagina = parseInt(pagina);
    if (pagina < 1) {
        return res.status(400).json({ error: 'O valor da página deve ser maior ou igual a 1' });
    }
    const offset = (pagina - 1) * limite;

    try {
        const { count, rows } = await Car.findAndCountAll({
            limit: limite,
            offset: offset
        });

        res.json({
            total: count,
            paginaAtual: pagina,
            totalPaginas: Math.ceil(count / limite),
            carros: rows
        });
    } catch (err) {
        console.error('Erro ao listar carros:', err);
        res.status(500).json({ error: 'Erro ao listar carros' });
    }
});

router.get('/carros/:id', verificarTokenUsuario, async (req, res) => {
    if (!req.user.admin) {
        return res.status(403).json({ error: 'Acesso restrito a administradores' });
    }

    try {
        const carro = await Car.findByPk(req.params.id);

        if (!carro) {
            return res.status(404).json({ error: 'Carro não encontrado' });
        }

        res.json(carro);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar o carro' });
    }
});

router.put('/carros/:id', verificarTokenUsuario, async (req, res) => {
    const { marca, ano, modelo } = req.body;
    const { id } = req.params;

    if (!marca || !ano || !modelo) {
        return res.status(400).json({ error: 'Todos os campos (marca, ano, modelo) são obrigatórios' });
    }

    try {
        const carro = await Car.findByPk(id);

        if (!carro) {
            return res.status(404).json({ error: 'Carro não encontrado' });
        }

        if (req.user.admin || carro.userId === req.user.id) {
            carro.marca = marca;
            carro.ano = ano;
            carro.modelo = modelo;
            await carro.save();
            
            res.json({ message: 'Carro atualizado com sucesso', carro });
        } else {
            res.status(403).json({ error: 'Você não tem permissão para editar este carro' });
        }
    } catch (err) {
        console.error('Erro ao editar o carro:', err);
        res.status(500).json({ error: 'Erro ao editar o carro' });
    }
});

router.delete('/carros/:id', verificarTokenUsuario, async (req, res) => {
    const { id } = req.params;

    try {
        const carro = await Car.findByPk(id);

        if (!carro) {
            return res.status(404).json({ error: 'Carro não encontrado' });
        }

        if (req.user.admin || carro.userId === req.user.id) {
            await carro.destroy();
            res.json({ message: 'Carro excluído com sucesso' });
        } else {
            res.status(403).json({ error: 'Você não tem permissão para excluir este carro' });
        }
    } catch (err) {
        console.error('Erro ao excluir o carro:', err);
        res.status(500).json({ error: 'Erro ao excluir o carro' });
    }
});

router.get('/carros/revenda/:id', verificarTokenUsuario, async (req, res) => {
    try {
      const carro = await Car.findByPk(req.params.id);
  
      if (!carro) {
        return res.status(404).json({ error: 'Carro não encontrado' });
      }
  
      const anoAtual = new Date().getFullYear();
      const anosUso = anoAtual - carro.ano;
      const valorRevenda = carro.valor * (1 - (anosUso * 0.05)); 
  
      res.json({ message: 'Valor de revenda calculado', carro, valorRevenda });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao calcular valor de revenda' });
    }
  });

// Rota feita em sala de aula
  router.get('/carros_usuario', verificarTokenUsuario, async (req, res) => {
    try {
        const carros = await Car.findAll({ where: { userId: req.user.id } });

        if (carros.length == 0) {
            return res.status(404).json({ message: 'Nenhum carro cadastrado para este usuário' });
        }

        res.json(carros);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar os carros' });
    }
}); 

router.get('/install', async (req, res) => {
    try {
        await sequelize.sync({ force: true });
        console.log('Tabelas criadas com sucesso.');

        const usuarios = [
            { usuario: 'user1', senha: 'senha1', admin: false },
            { usuario: 'user2', senha: 'senha2', admin: false },
            { usuario: 'user3', senha: 'senha3', admin: false },
            { usuario: 'user4', senha: 'senha4', admin: false }
        ];
        
        for (const user of usuarios) {
            await User.create(user);
        }
        console.log('Usuários inseridos com sucesso.');

        const carros = [
            { marca: 'Toyota', ano: 2024, modelo: 'Corolla', valor: 138000, userId: 1 }, 
            { marca: 'Honda', ano: 2019, modelo: 'Civic', valor: 106000, userId: 3 },   
            { marca: 'Ford', ano: 2018, modelo: 'Focus', valor: 80000, userId: 4 },   
            { marca: 'Chevrolet', ano: 2021, modelo: 'Onix', valor: 65000, userId: 5 }, 
            { marca: 'Volkswagen', ano: 2017, modelo: 'Gol', valor: 42000, userId: 2 }  
        ];

        for (const carro of carros) {
            await Car.create(carro);
        }
        console.log('Carros inseridos com sucesso.');

        res.status(201).json({
            message: 'Instalação realizada com sucesso. Banco de dados preenchido.'
        });
    } catch (err) {
        console.error('Erro na instalação:', err);
        res.status(500).json({ error: 'Erro ao realizar a instalação do banco de dados' });
    }
});

module.exports = router;