# API de Gestão de Usuários e Carros

Este projeto é uma API desenvolvida em Node.js usando Express e SQLite para realizar a gestão de usuários e carros. Possui funcionalidades de autenticação JWT, gerenciamento de usuários com níveis de privilégios (usuários comuns e administradores), e operações de CRUD para carros com validações e permissões baseadas em privilégios.

## Funcionalidades

### Usuários
- **Cadastro de Usuários**: Cria novos usuários com autenticação via `usuario` e `senha`.
- **Autenticação JWT**: Login com geração de token JWT para proteger as rotas da aplicação.
- **Gestão de Privilégios**: Administradores podem criar, editar e excluir outros usuários, bem como promover usuários comuns a administradores.
- **Rotas Protegidas**: Usuários autenticados podem editar seus próprios dados, e administradores têm permissões adicionais.
- **Criação Automática de Admin**: Na instalação da API, um administrador padrão é criado (`usuario: admin, senha: admin123`).

### Carros
- **Cadastro de Carros**: Usuários autenticados podem cadastrar carros informando marca, ano, modelo e valor.
- **CRUD de Carros**: Operações de criar, editar, listar e excluir carros. Apenas administradores podem listar ou editar carros de outros usuários.
- **Cálculo de Revenda**: Endpoint especial que calcula o valor de revenda de um carro baseado em sua idade.

### Funcionalidades Diversas
- **Instalação do Banco de Dados**: Rota `GET /install/` que cria e popula as tabelas do banco de dados com dados de exemplo.
- **Paginação**: Implementação de paginação para a listagem de carros.
- **Documentação Swagger**: Rota `GET /docs/` com a documentação da API gerada automaticamente pela biblioteca `swagger-autogen`.

## Requisitos

- Node.js 
- SQLite
