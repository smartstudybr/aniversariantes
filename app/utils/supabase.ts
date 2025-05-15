// app/utils/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Garante que as variáveis de ambiente estão disponíveis
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

// Teste de conexão simples (opcional)
const testConnection = async () => {
  try {
    const { error } = await supabase.from('aniversariantes').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Erro ao conectar ao Supabase:', error);
    } else {
      console.log('Conexão com Supabase estabelecida com sucesso');
    }
  } catch (err) {
    console.error('Erro ao tentar conectar ao Supabase:', err);
  }
};

// Execute o teste de conexão quando o arquivo for carregado
testConnection();

export default supabase;