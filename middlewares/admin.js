const jwt = require('jsonwebtoken');
const { User } = require('../database'); 

function verificarTokenAdmin(req, res, next) {
    const bearToken = req.headers['authorization'] || "";
    let token = bearToken.split(" ");
    if (token[0] == "Bearer") {
        token = token[1];
    }

    jwt.verify(token, 'abc123', async (err, decoded) => {
        if (err) {
            return res.status(500).json({ error: 'Falha ao autenticar o token.' });
        }

        const user = await User.findByPk(decoded.id);

        if (!user || !user.admin) {
            return res.status(403).json({ error: 'Acesso negado: apenas administradores podem realizar esta ação.' });
        }

        req.user = user;
        next();
    });
}

module.exports = verificarTokenAdmin;
