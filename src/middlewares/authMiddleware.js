const authMiddleware = {
  verificarSessao(req, res, next) {
    if (req.session && req.session.usuario) {
      return next();
    }
    return res.redirect('/login');
  },

  verificarAdmin(req, res, next) {
    if (req.session && req.session.usuario && req.session.usuario.role === 'admin') {
      return next();
    }
    return res.status(403).send('Acesso negado. Apenas administradores podem acessar esta página.');
  }
};

module.exports = authMiddleware;