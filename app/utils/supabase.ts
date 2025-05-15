// app/utils/supabase.ts - Versão simplificada com mensagens de depuração
import { createClient } from '@supabase/supabase-js';

// Garante que as variáveis de ambiente estão disponíveis
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log de depuração
console.log('[Debug] Iniciando cliente Supabase');
console.log('[Debug] URL:', supabaseUrl?.substring(0, 20) + '...');
console.log('[Debug] Chave definida:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Variáveis de ambiente do Supabase não encontradas:', {
    url: supabaseUrl ? 'OK' : 'Ausente',
    key: supabaseKey ? 'OK' : 'Ausente'
  });
}

// Criação do cliente com opções adicionais
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (...args) => fetch(...args),
  },
});

// Nome do bucket (exatamente como está no Supabase)
export const BUCKET_NAME = 'aniversariantes-bucket';

// Verificação simplificada
export const checkBucketExists = async () => {
  try {
    // Verificar buckets
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME) || false;
    
    return { 
      exists: bucketExists,
      message: bucketExists 
        ? `Bucket "${BUCKET_NAME}" encontrado.` 
        : `Bucket "${BUCKET_NAME}" não existe. É necessário criá-lo no Dashboard do Supabase.`
    };
  } catch (err) {
    console.error('Erro ao verificar bucket:', err);
    return { 
      exists: false, 
      error: err,
      message: 'Erro ao verificar bucket.'
    };
  }
};

// Função para obter URL pública de um arquivo
export const getPublicUrl = (filePath: string) => {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
  return data.publicUrl;
};

// Teste básico de conexão
console.log('[Debug] Tentando conectar ao Supabase...');

// Testa conexão com banco
(async () => {
  try {
    const { error } = await supabase.from('aniversariantes').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('[Debug] Erro ao conectar ao banco:', error);
    } else {
      console.log('[Debug] Conexão com banco de dados estabelecida com sucesso');
    }
  } catch (err) {
    console.error('[Debug] Exceção ao tentar conectar ao banco:', err);
  }
})();

// Testa conexão com bucket
supabase.storage.from(BUCKET_NAME).list()
  .then(({ data, error }) => {
    if (error) {
      console.error('[Debug] Erro ao acessar bucket:', error);
    } else {
      console.log(`[Debug] Bucket "${BUCKET_NAME}" acessado com sucesso. Arquivos:`, data?.length || 0);
    }
  })
  .catch(err => {
    console.error('[Debug] Exceção ao tentar acessar bucket:', err);
  });

export default supabase;