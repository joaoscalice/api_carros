const jwt = require('jsonwebtoken');

function verificarTokenUsuario(req, res, next) {
    const bearToken = req.headers['authorization'] || "";
    let token = bearToken.split(" ");
    if (token[0] == "Bearer") {
        token = token[1];
    }

    jwt.verify(token, 'abc123', async (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido ou expirado' });
        }

        req.user = decoded;
        next();
    });
}

module.exports = verificarTokenUsuario;
