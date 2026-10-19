const supabase = require('../config/supabase');

const OFICINAS_VALIDAS = [
  'SERRALHERIA',
  'MALHARIA',
  'MARCENARIA',
  'ADMINISTRATIVO',
  'ARTESANATO',
  'CHINELOS',
  'PANIFICAÇÃO',
  'MARCENARIA/SERRALHERIA',
  'MOCHILAS'
];

const STATUS_VALIDOS = [
  'CONCLUÍDO',
  'EM ANDAMENTO',
  'PENDENTE',
  'CANCELADO/ARQUIVADO'
];

function criarPadraoBuscaSei(termo) {
  const apenasDigitos = termo.replace(/\D/g, '');
  if (apenasDigitos.length >= 2) {
    return '%' + apenasDigitos.split('').join('%') + '%';
  }
  return null;
}

const recebidosService = {
  OFICINAS_VALIDAS,
  STATUS_VALIDOS,

  async listarTodos(filtros = {}) {
    let query = supabase
      .schema('memorando')
      .from('recebidos')
      .select('*')
      .order('data_recebimento', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (filtros.busca) {
      const b = filtros.busca.trim();
      const padraoSei = criarPadraoBuscaSei(b);

      if (padraoSei) {
        query = query.or(
          `numero_processo_sei.ilike.${padraoSei},numero_processo_sei.ilike.%${b}%,assunto.ilike.%${b}%,remetente.ilike.%${b}%,acao.ilike.%${b}%,observacoes.ilike.%${b}%,ultimo_documento_recebido.ilike.${padraoSei},ultimo_documento_recebido.ilike.%${b}%`
        );
      } else {
        query = query.or(
          `numero_processo_sei.ilike.%${b}%,assunto.ilike.%${b}%,remetente.ilike.%${b}%,acao.ilike.%${b}%,observacoes.ilike.%${b}%,ultimo_documento_recebido.ilike.%${b}%`
        );
      }
    }

    // Suporte a múltiplos status (array ou string)
    if (filtros.status) {
      const statusArray = Array.isArray(filtros.status) ? filtros.status : [filtros.status];
      if (statusArray.length > 0 && statusArray[0] !== '') {
        query = query.in('status', statusArray);
      }
    }

    // Suporte a múltiplas oficinas (array ou string)
    if (filtros.oficina) {
      const oficinaArray = Array.isArray(filtros.oficina) ? filtros.oficina : [filtros.oficina];
      if (oficinaArray.length > 0 && oficinaArray[0] !== '') {
        query = query.in('oficina', oficinaArray);
      }
    }

    const { data, error } = await query;
    if (error) throw new Error(`Erro ao listar recebidos: ${error.message}`);
    return data;
  },

  async obterResumo() {
    const { data, error } = await supabase.schema('memorando').from('recebidos').select('status');
    if (error) throw new Error(`Erro ao obter resumo: ${error.message}`);

    return {
      total: data.length,
      concluidos: data.filter((i) => (i.status || '').toUpperCase() === 'CONCLUÍDO').length,
      emAndamento: data.filter((i) => (i.status || '').toUpperCase() === 'EM ANDAMENTO').length,
      pendentes: data.filter((i) => (i.status || '').toUpperCase() === 'PENDENTE').length,
      cancelados: data.filter((i) => (i.status || '').toUpperCase() === 'CANCELADO/ARQUIVADO').length,
    };
  },

  async criar(dados) {
    const payload = {
      numero_processo_sei: dados.numero_processo_sei?.trim(),
      data_recebimento: dados.data_recebimento || null,
      tipo: dados.tipo?.trim() || null,
      remetente: dados.remetente?.trim() || null,
      assunto: dados.assunto?.trim() || null,
      oficina: dados.oficina || null,
      status: (dados.status || 'PENDENTE').toUpperCase(),
      acao: dados.acao?.trim() || null,
      data: dados.data || null,
      observacoes: dados.observacoes?.trim() || null,
      ultimo_documento_recebido: dados.ultimo_documento_recebido?.trim() || null,
    };

    const { data, error } = await supabase
      .schema('memorando')
      .from('recebidos')
      .insert([payload])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(`Já existe um processo recebido cadastrado com os números do SEI "${payload.numero_processo_sei}" (mesmo com pontuação diferente).`);
      }
      throw new Error(`Erro ao cadastrar memorando recebido: ${error.message}`);
    }
    return data;
  },

  async atualizar(id, dados) {
    const payload = {
      numero_processo_sei: dados.numero_processo_sei?.trim(),
      data_recebimento: dados.data_recebimento || null,
      tipo: dados.tipo?.trim() || null,
      remetente: dados.remetente?.trim() || null,
      assunto: dados.assunto?.trim() || null,
      oficina: dados.oficina || null,
      status: (dados.status || 'PENDENTE').toUpperCase(),
      acao: dados.acao?.trim() || null,
      data: dados.data || null,
      observacoes: dados.observacoes?.trim() || null,
      ultimo_documento_recebido: dados.ultimo_documento_recebido?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .schema('memorando')
      .from('recebidos')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(`Outro registro já utiliza os números do Processo SEI "${payload.numero_processo_sei}".`);
      }
      throw new Error(`Erro ao atualizar memorando recebido: ${error.message}`);
    }
    return data;
  },

  async excluir(id) {
    const { error } = await supabase.schema('memorando').from('recebidos').delete().eq('id', id);
    if (error) throw new Error(`Erro ao excluir memorando recebido: ${error.message}`);
    return true;
  }
};

module.exports = recebidosService;