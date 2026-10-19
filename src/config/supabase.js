require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERRO: SUPABASE_URL e SUPABASE_KEY devem estar definidos no arquivo .env');
  process.exit(1);
}

// Inicializa o cliente apontando por padrão para o schema 'memorando'
const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'memorando'
  }
});

module.exports = supabase;