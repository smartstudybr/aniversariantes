// hooks/useAniversariantes.ts
import { useState, useEffect, useCallback } from 'react';
import supabase, { BUCKET_NAME } from '@/utils/supabase';
import { v4 as uuidv4 } from 'uuid';
import { toastSuccess, toastError } from '@/components/ui/sonner';

// Tipo para aniversariante
export interface Aniversariante {
  id: string;
  nome: string;
  departamento?: string;
  data: string;          // formato "DD/MM"
  email?: string;
  foto?: string;         // URL
  created_at?: string;   // Campo adicional para o Supabase
}

// Tipo para novo aniversariante (sem id)
export type NovoAniversariante = Omit<Aniversariante, 'id'>;

// Interface para retorno de hook
interface UseAniversariantesReturn {
  aniversariantes: Aniversariante[];
  aniversariantesFiltrados: Aniversariante[];
  carregando: boolean;
  adicionando: boolean;
  mesSelecionado: number;
  setMesSelecionado: React.Dispatch<React.SetStateAction<number>>;
  carregarAniversariantes: () => Promise<void>;
  adicionarAniversariante: (
    dadosAniversariante: NovoAniversariante, 
    selectedFile: File | null
  ) => Promise<boolean>;
  removerAniversariante: (id: string) => Promise<boolean>;
}

export const useAniversariantes = (): UseAniversariantesReturn => {
  // Estados principais
  const [aniversariantes, setAniversariantes] = useState<Aniversariante[]>([]);
  const [aniversariantesFiltrados, setAniversariantesFiltrados] = useState<Aniversariante[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [adicionando, setAdicionando] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());

  // Função para carregar aniversariantes do Supabase
  const carregarAniversariantes = useCallback(async () => {
    try {
      setCarregando(true);
      console.log('Carregando aniversariantes do Supabase...');
      
      const { data, error } = await supabase
        .from('aniversariantes')
        .select('*');
      
      if (error) {
        console.error('Erro detalhado ao carregar aniversariantes:', error);
        throw error;
      }
      
      console.log('Aniversariantes carregados com sucesso:', data?.length || 0);
      
      if (data) {
        // Certifique-se de que as URLs das fotos estão com protocolo https://
        const aniversariantesProcessados = data.map(anv => {
          if (anv.foto && !anv.foto.startsWith('http')) {
            anv.foto = `https://${anv.foto}`;
          }
          return anv;
        });
        
        setAniversariantes(aniversariantesProcessados);
      }
    } catch (error) {
      console.error('Erro ao carregar aniversariantes:', error);
      toastError('Erro ao carregar aniversariantes', 
        'Não foi possível carregar os dados. Tente novamente mais tarde.');
    } finally {
      setCarregando(false);
    }
  }, []);

  // Função para adicionar um novo aniversariante
  const adicionarAniversariante = useCallback(async (
  dadosAniversariante: NovoAniversariante,
  selectedFile: File | null
): Promise<boolean> => {
  // Validação básica
  if (!dadosAniversariante.nome || !dadosAniversariante.data) {
    toastError('Campos obrigatórios', 
      'Nome e data de aniversário são obrigatórios');
    return false;
  }
  
  // Validar o formato da data (DD/MM)
  const dataRegex = /^\d{2}\/\d{2}$/;
  if (!dataRegex.test(dadosAniversariante.data)) {
    toastError('Formato inválido', 
      'A data deve estar no formato DD/MM');
    return false;
  }
  
  // Validar que o dia está entre 1 e 31 e o mês entre 1 e 12
  const [dia, mes] = dadosAniversariante.data.split('/').map(Number);
  if (dia < 1 || dia > 31 || mes < 1 || mes > 12) {
    toastError('Data inválida', 
      'O dia deve estar entre 1 e 31 e o mês entre 1 e 12');
    return false;
  }
  
  try {
    setAdicionando(true); // Ativar indicador de carregamento
    
    let fotoUrl: string | undefined;

    // Verificar se há um arquivo selecionado para upload
    if (selectedFile) {
      try {
        console.log('Iniciando upload do arquivo...');
        
        // Gera um nome único para o arquivo
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = fileName; // Caminho dentro do bucket
        
        // Fazer upload do arquivo diretamente usando Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from(BUCKET_NAME)
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: true // Sobrescrever caso exista
          });
        
        if (uploadError) {
          console.error('Erro de upload:', uploadError);
          throw uploadError;
        }
        
        console.log('Upload bem-sucedido!', uploadData);
        
        // Obter a URL pública do arquivo
        const { data: publicUrlData } = supabase
          .storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);
        
        fotoUrl = publicUrlData.publicUrl;
        
        console.log('URL da foto gerada:', fotoUrl);
      } catch (uploadErr) {
        console.error('Erro detalhado no processo de upload:', uploadErr);
        toastError('Erro no upload', 'Não foi possível fazer upload da imagem. Verifique o console para mais detalhes.');
        setAdicionando(false);
        return false;
      }
    }

    // Criar um ID para o novo aniversariante
    const newId = uuidv4();

    // Preparar o objeto para inserção
    const payload = {
      id: newId,
      nome: dadosAniversariante.nome,
      departamento: dadosAniversariante.departamento || null,
      data: dadosAniversariante.data,
      email: dadosAniversariante.email || null,
      foto: fotoUrl || null
    };

    console.log('Payload a ser inserido:', payload);

    // Inserir no banco de dados
    const { data, error } = await supabase
      .from('aniversariantes')
      .insert([payload])
      .select();

    if (error) {
      console.error('Erro ao inserir no banco:', error);
      throw error;
    }
    
    if (data && data.length > 0) {
      // Atualiza estado
      setAniversariantes(prev => [...prev, data[0]]);
      
      // REMOVIDO: o toast de sucesso para evitar duplicação
      // toastSuccess('Aniversariante adicionado', 'Tudo certo!');
      
      return true;
    } else {
      throw new Error('Dados não foram retornados após inserção');
    }
  } catch (err) {
    console.error('Erro ao adicionar aniversariante:', err);
    toastError('Erro ao adicionar', 'Não foi possível adicionar o aniversariante');
    return false;
  } finally {
    setAdicionando(false); // Desativar indicador de carregamento independente do resultado
  }
}, []);

  // Função para remover aniversariante
  // Função para remover aniversariante
const removerAniversariante = useCallback(async (id: string): Promise<boolean> => {
  try {
    console.log('Iniciando remoção do aniversariante com ID:', id);
    
    // Primeiro busca o aniversariante para ver se tem foto para excluir
    const { data: aniversarianteData, error: fetchError } = await supabase
      .from('aniversariantes')
      .select('foto')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Erro ao buscar dados do aniversariante:', fetchError);
      throw fetchError;
    }
    
    console.log('Dados do aniversariante recuperados:', aniversarianteData);
    
    // Se tiver foto, tenta remover do storage
    if (aniversarianteData?.foto) {
      try {
        // Extrai o nome do arquivo da URL
        const url = new URL(aniversarianteData.foto);
        const pathSegments = url.pathname.split('/');
        const fileName = pathSegments[pathSegments.length - 1];
        
        console.log('Tentando remover arquivo:', fileName);
        
        // Remove o arquivo do storage
        const { error: storageError } = await supabase
          .storage
          .from(BUCKET_NAME)
          .remove([fileName]);
          
        if (storageError) {
          console.warn('Erro ao remover arquivo:', storageError);
          // Continua mesmo se não conseguir remover o arquivo
        } else {
          console.log('Arquivo removido com sucesso:', fileName);
        }
      } catch (fileError) {
        console.warn('Erro ao processar URL da foto:', fileError);
        // Continua o processo mesmo se falhar ao remover o arquivo
      }
    }
    
    // Remove o aniversariante do banco
    console.log('Tentando remover aniversariante do banco de dados...');
    const { error: deleteError } = await supabase
      .from('aniversariantes')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Erro ao remover aniversariante do banco:', deleteError);
      throw deleteError;
    }
    
    console.log('Aniversariante removido com sucesso do banco de dados');
    
    // Atualizar o estado local somente após confirmação de exclusão bem-sucedida
    setAniversariantes(prev => prev.filter(anv => anv.id !== id));
    
    toastSuccess('Aniversariante removido', 
      'Aniversariante removido com sucesso!');
    return true;
  } catch (error: any) {
    console.error('Erro completo ao remover aniversariante:', error);
    toastError('Erro ao remover', error.message || 'Não foi possível remover o aniversariante');
    
    // Recarrega os dados para garantir sincronização com o banco
    carregarAniversariantes();
    return false;
  }
}, [carregarAniversariantes]);

  // Carregar aniversariantes quando o componente é montado
  useEffect(() => {
    carregarAniversariantes();
  }, [carregarAniversariantes]);
  
  // Filtrar aniversariantes pelo mês selecionado
  useEffect(() => {
    const filtrados = aniversariantes.filter((aniversariante) => {
      if (!aniversariante.data) return false;
      const dataParts = aniversariante.data.split('/');
      const mes = parseInt(dataParts[1], 10) - 1; // Mês começa do 0 em JS
      return mes === mesSelecionado;
    });
    
    setAniversariantesFiltrados(filtrados);
  }, [aniversariantes, mesSelecionado]);

  return {
    aniversariantes,
    aniversariantesFiltrados,
    carregando,
    adicionando,
    mesSelecionado,
    setMesSelecionado,
    carregarAniversariantes,
    adicionarAniversariante,
    removerAniversariante
  };
};