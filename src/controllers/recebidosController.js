const recebidosService = require('../services/recebidosService');

const recebidosController = {
  async index(req, res) {
    try {
      const filtros = {
        busca: req.query.busca || '',
        status: req.query.status || '',
        oficina: req.query.oficina || '',
      };

      const [memorandos, resumo] = await Promise.all([
        recebidosService.listarTodos(filtros),
        recebidosService.obterResumo(),
      ]);

      res.render('recebidos', {
        abaAtiva: 'recebidos',
        memorandos,
        resumo,
        filtros,
        oficinasValidas: recebidosService.OFICINAS_VALIDAS,
        statusValidos: recebidosService.STATUS_VALIDOS,
        sucesso: req.query.sucesso || null,
        erro: req.query.erro || null,
      });
    } catch (error) {
      res.render('recebidos', {
        abaAtiva: 'recebidos',
        memorandos: [],
        resumo: { total: 0, concluidos: 0, emAndamento: 0, pendentes: 0, cancelados: 0 },
        filtros: { busca: '', status: '', oficina: '' },
        oficinasValidas: recebidosService.OFICINAS_VALIDAS,
        statusValidos: recebidosService.STATUS_VALIDOS,
        sucesso: null,
        erro: error.message,
      });
    }
  },

  async store(req, res) {
    try {
      await recebidosService.criar(req.body);
      res.redirect('/recebidos?sucesso=' + encodeURIComponent('Memorando recebido cadastrado com sucesso!'));
    } catch (error) {
      res.redirect('/recebidos?erro=' + encodeURIComponent(error.message));
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      await recebidosService.atualizar(id, req.body);
      res.redirect('/recebidos?sucesso=' + encodeURIComponent('Memorando recebido atualizado com sucesso!'));
    } catch (error) {
      res.redirect('/recebidos?erro=' + encodeURIComponent(error.message));
    }
  },

  async destroy(req, res) {
    try {
      const { id } = req.params;
      await recebidosService.excluir(id);
      res.redirect('/recebidos?sucesso=' + encodeURIComponent('Memorando recebido excluído com sucesso!'));
    } catch (error) {
      res.redirect('/recebidos?erro=' + encodeURIComponent(error.message));
    }
  }
};

module.exports = recebidosController;