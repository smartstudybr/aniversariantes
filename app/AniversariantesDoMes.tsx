import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Cake, Calendar, Plus, UserPlus, Mail, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toastSuccess, toastError, toastInfo } from '@/components/ui/sonner';
import supabase from '@/utils/supabase'
import { v4 as uuidv4 } from 'uuid';


// Lista de meses em português
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const DEPARTAMENTOS = ['RCDC1','RCDC2','RCDC3','RCDC4','RCDC5','RCDC6','RCDC7','RCDC8','RCDC9','RCDC0'];

interface Aniversariante {
  id: string;
  nome: string;
  departamento?: string;
  data: string;          // formato "DD/MM"
  email?: string;
  foto?: string;         // DataURL
  created_at?: string;   // Campo adicional para o Supabase
}

const AniversariantesDoMes = () => {
  // Estado para armazenar o mês selecionado
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth());
  
  // Estado para armazenar todos os aniversariantes
  const [aniversariantes, setAniversariantes] = useState<Aniversariante[]>([]);
  
  // Estado para os aniversariantes filtrados
  const [aniversariantesFiltrados, setAniversariantesFiltrados] = useState<Aniversariante[]>([]);
  
  // Estado para indicar carregamento
  const [carregando, setCarregando] = useState(true);
  
  // Estado para indicar carregamento de adição
  const [adicionando, setAdicionando] = useState(false);
  
  // Estado para o modal de adição de novo aniversariante
  type NovoAniversariante = Omit<Aniversariante, 'id'>;
  const [novoAniversariante, setNovoAniversariante] = useState<NovoAniversariante>({
    nome: '',
    departamento: '',
    data: '',
    email: '',
    foto: undefined
  });
  
  // Estado para armazenar a URL da imagem prévia
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Estado para controlar a abertura do modal
  const [modalAberto, setModalAberto] = useState(false);

  // Carregar aniversariantes do Supabase quando o componente é montado
  useEffect(() => {
    carregarAniversariantes();
  }, []);
  
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
  
  // Função para carregar aniversariantes do Supabase
  const carregarAniversariantes = async () => {
    try {
      setCarregando(true);
      const { data, error } = await supabase
        .from('aniversariantes')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setAniversariantes(data);
      }
    } catch (error) {
      console.error('Erro ao carregar aniversariantes:', error);
      toastError('Erro ao carregar aniversariantes', 
        'Não foi possível carregar os dados. Tente novamente mais tarde.');
    } finally {
      setCarregando(false);
    }
  };
  
  // Manipulador para mudança de campos do formulário
  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setNovoAniversariante({
      ...novoAniversariante,
      [name]: value
    });
  };
  
  // Manipulador para upload de imagem
  const inputRef = useRef<HTMLInputElement>(null);
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toastError('Arquivo muito grande', 
        'A imagem deve ter no máximo 2MB');
      return;
    }

    // Armazena o objeto File
    setSelectedFile(file);

    // Gera preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Função para adicionar um novo aniversariante
  const adicionarAniversariante = async () => {
    // Validação básica
    if (!novoAniversariante.nome || !novoAniversariante.data) {
      toastError('Campos obrigatórios', 
        'Nome e data de aniversário são obrigatórios');
      return;
    }
    
    // Validar o formato da data (DD/MM)
    const dataRegex = /^\d{2}\/\d{2}$/;
    if (!dataRegex.test(novoAniversariante.data)) {
      toastError('Formato inválido', 
        'A data deve estar no formato DD/MM');
      return;
    }
    
    // Validar que o dia está entre 1 e 31 e o mês entre 1 e 12
    const [dia, mes] = novoAniversariante.data.split('/').map(Number);
    if (dia < 1 || dia > 31 || mes < 1 || mes > 12) {
      toastError('Data inválida', 
        'O dia deve estar entre 1 e 31 e o mês entre 1 e 12');
      return;
    }
    
    try {
      setAdicionando(true); // Ativar indicador de carregamento
      
      let fotoUrl: string | undefined;

      if (selectedFile) {
        try {
          // gera um nome único
          const fileExt = selectedFile.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExt}`;
          const filePath = `aniversariantes/${fileName}`;
          
          // Upload da imagem
          const { error: uploadError } = await supabase
            .storage
            .from('aniversariantes')
            .upload(filePath, selectedFile);
            
          if (uploadError) {
            console.error('Erro no upload:', uploadError);
            throw uploadError;
          }

          // Obter URL pública
          const { data: publicUrlData } = supabase
            .storage
            .from('aniversariantes')
            .getPublicUrl(filePath);

          fotoUrl = publicUrlData.publicUrl;
        } catch (uploadErr) {
          console.error('Erro no processo de upload:', uploadErr);
          toastError('Erro no upload', 'Não foi possível fazer upload da imagem');
          setAdicionando(false);
          return;
        }
      }

      // Preparar o objeto para inserção
      const payload = {
        ...novoAniversariante,
        foto: fotoUrl
      };

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
        // atualiza estado
        setAniversariantes(prev => [...prev, data[0]]);
        
        // Limpar o formulário e fechar o modal
        setNovoAniversariante({
          nome: '',
          departamento: '',
          data: '',
          email: '',
          foto: undefined
        });
        setPreviewImage(null);
        setSelectedFile(null);
        setModalAberto(false);
        
        toastSuccess('Aniversariante adicionado', 'Tudo certo!');
      } else {
        throw new Error('Dados não foram retornados após inserção');
      }
    } catch (err) {
      console.error('Erro ao adicionar aniversariante:', err);
      toastError('Erro ao adicionar', 'Não foi possível adicionar o aniversariante');
    } finally {
      setAdicionando(false); // Desativar indicador de carregamento independente do resultado
    }
  };
  
  // Função para remover um aniversariante
  const removerAniversariante = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este aniversariante?')) {
      try {
        const { error } = await supabase
          .from('aniversariantes')
          .delete()
          .eq('id', id);
        
        if (error) {
          throw error;
        }
        
        // Atualizar o estado local
        setAniversariantes(prev => prev.filter(anv => anv.id !== id));
        toastSuccess('Aniversariante removido', 
          'Aniversariante removido com sucesso!');
      } catch (error) {
        console.error('Erro ao remover aniversariante:', error);
        toastError('Erro', 'Não foi possível remover o aniversariante');
      }
    }
  };
  
  // Função para enviar um email de parabéns
  const enviarEmail = (anv: Aniversariante) => {
    if (!anv.email) return;
    
    // Criar o assunto e corpo do email
    const assunto = `Feliz Aniversário, ${anv.nome}!`;
    const corpo = `Olá ${anv.nome},\n\nDesejamos a você um feliz aniversário e um dia repleto de alegrias!\n\nAtenciosamente,\nEquipe da Empresa`;
    
    // Abrir o cliente de email padrão
    window.open(`mailto:${anv.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`);
    
    toastInfo('Email aberto', 
      `Email para ${anv.nome} aberto no seu cliente de email`);
  };
  
  // Obter o número do dia de um aniversariante
  const obterDia = (data: string) => {
    if (!data) return 0;
    return parseInt(data.split('/')[0], 10);
  };
  
  // Obter as iniciais do nome para o avatar
  const obterIniciais = (nome: string) => {
    if (!nome) return '';
    const partes = nome.split(' ');
    if (partes.length > 1) {
      return `${partes[0][0]}${partes[1][0]}`;
    }
    return partes[0][0];
  };
  
  // Gerar uma cor de fundo para o avatar baseada no nome
  const obterCorAvatar = (nome: string) => {
    if (!nome) return 'bg-gray-400';
    
    const cores = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    
    // Gera um número baseado na soma dos códigos ASCII dos caracteres do nome
    const soma = nome.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return cores[soma % cores.length];
  };

  function handleDepartamentoChange(v: string) {
    setNovoAniversariante(prev => ({
      ...prev,
      departamento: v
    }));
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Cake size={28} className="text-pink-500" />
          <h1 className="text-3xl font-bold text-center">Aniversariantes do Mês</h1>
        </div>
        <p className="text-gray-500 mb-6">Celebre com nossos colegas!</p>
        
        {/* Seletor de mês */}
        <div className="w-full max-w-xs">
          <Select 
            value={mesSelecionado.toString()} 
            onValueChange={(value) => setMesSelecionado(parseInt(value, 10))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {MESES.map((mes, index) => (
                <SelectItem key={index} value={index.toString()}>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{mes}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Cabeçalho com contador e botão de adicionar */}
      <div className="flex justify-between items-center mb-6">
        <Badge variant="outline" className="text-sm py-1 px-3">
          {aniversariantesFiltrados.length} aniversariantes em {MESES[mesSelecionado]}
        </Badge>
        
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <UserPlus size={16} />
              <span>Adicionar Aniversariante</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Aniversariante</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center gap-4 mb-4">
                <div 
                  className={`${previewImage ? '' : 'bg-gray-200'} cursor-pointer w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300`}
                  onClick={() => inputRef.current?.click()}
                >
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Plus size={24} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <Input
                    id="foto"
                    type="file"
                    accept="image/*"
                    ref={inputRef}
                    className="w-full cursor-pointer"
                    onChange={handleImageUpload}
                  />
                  <p className="text-xs text-gray-500 mt-1">Tamanho máximo: 2MB</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={novoAniversariante.nome}
                    onChange={handleInputChange}
                    placeholder="Nome completo"
                    required
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Select
                    value={novoAniversariante.departamento}
                    onValueChange={(v) => handleDepartamentoChange(v)}
                  >
                    <SelectTrigger className="w-full cursor-pointer">
                      <SelectValue placeholder="Selecione o departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTAMENTOS.map((dep) => (
                        <SelectItem key={dep} value={dep} className="cursor-pointer">
                          {dep}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Label htmlFor="data">Data de Aniversário *</Label>
                  <Input
                    id="data"
                    name="data"
                    value={novoAniversariante.data}
                    onChange={handleInputChange}
                    placeholder="DD/MM (Ex: 05/06)"
                    required
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={novoAniversariante.email}
                    onChange={handleInputChange}
                    placeholder="email@empresa.com.br"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalAberto(false)} disabled={adicionando}>
                Cancelar
              </Button>
              <Button 
                onClick={adicionarAniversariante} 
                disabled={adicionando}
                className="relative"
              >
                {adicionando ? (
                  <>
                    <span className="opacity-0">Adicionar</span>
                    <span className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                    </span>
                  </>
                ) : (
                  'Adicionar'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Estado de carregamento */}
      {carregando ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      ) : aniversariantesFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aniversariantesFiltrados
            .sort((a, b) => obterDia(a.data) - obterDia(b.data))
            .map((aniversariante) => (
              <Card key={aniversariante.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{aniversariante.nome}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className="bg-pink-500">{aniversariante.data}</Badge>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-gray-400 hover:text-red-500" 
                        onClick={() => removerAniversariante(aniversariante.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{aniversariante.departamento}</CardDescription>
                </CardHeader>
                
                <CardContent className="flex items-center gap-4 pt-0">
                  <div className={`${aniversariante.foto ? '' : obterCorAvatar(aniversariante.nome)} w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold overflow-hidden`}>
                    {aniversariante.foto ? (
                      <img src={aniversariante.foto} alt={aniversariante.nome} className="w-full h-full object-cover" />
                    ) : (
                      obterIniciais(aniversariante.nome)
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Aniversário dia <span className="font-semibold">{obterDia(aniversariante.data)}</span>
                    </p>
                    {aniversariante.email && (
                      <p className="text-xs text-gray-400 mt-1">{aniversariante.email}</p>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="bg-gray-50 dark:bg-gray-800">
                  <div className="w-full flex justify-center">
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-2 text-sm text-pink-500 hover:text-pink-700 transition-colors"
                      onClick={() => enviarEmail(aniversariante)}
                      disabled={!aniversariante.email}
                    >
                      <Mail size={16} />
                      <span>Enviar mensagem</span>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="mb-4 text-gray-400">
            <Cake size={48} />
          </div>
          <h3 className="text-xl font-medium mb-2">Nenhum aniversariante encontrado</h3>
          <p className="text-gray-500 text-center mb-6">
            Não há aniversariantes registrados para o mês de {MESES[mesSelecionado]}.
          </p>
          <Dialog open={modalAberto} onOpenChange={setModalAberto}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus size={16} />
                <span>Adicione seu aniversário</span>
              </Button>
            </DialogTrigger>
            {/* O conteúdo do modal é o mesmo definido acima */}
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default AniversariantesDoMes;