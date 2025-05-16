// AniversariantesDoMes.tsx (Refatorado)
import React, { useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Cake, Calendar, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormAniversariante } from '@/components/FormAniversariante';
import { ListaAniversariantes } from '@/components/ListaAniversariantes';
import { useAniversariantes, type NovoAniversariante } from './hooks/useAniversariantes';
import { toastInfo } from '@/components/ui/sonner';

// Lista de meses em português
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const DEPARTAMENTOS = ['RCDC1','RCDC2','RCDC3','RCDC4','RCDC5','RCDC6','RCDC7','RCDC8','RCDC9','RCDC0'];

const AniversariantesDoMes: React.FC = () => {
  // Usar o hook personalizado
  const {
    aniversariantesFiltrados,
    carregando,
    adicionando,
    mesSelecionado,
    setMesSelecionado,
    adicionarAniversariante,
    removerAniversariante
  } = useAniversariantes();
  
  // Estado para controlar a abertura do modal
  const [modalAberto, setModalAberto] = useState(false);
  
  // Função para lidar com a adição de novo aniversariante
  const handleAdicionarAniversariante = useCallback(async (
    dadosAniversariante: NovoAniversariante, 
    arquivo: File | null
  ) => {
    const sucesso = await adicionarAniversariante(dadosAniversariante, arquivo);
    if (sucesso) {
      setModalAberto(false);
    }
  }, [adicionarAniversariante]);
  
  // Função para abrir o modal
  const abrirModal = useCallback(() => {
    setModalAberto(true);
  }, []);
  
  // Função para fechar o modal
  const fecharModal = useCallback(() => {
    setModalAberto(false);
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
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
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between items-center mb-6">
        <Badge variant="secondary" className="text-sm py-2 px-3">
          {aniversariantesFiltrados.length} aniversariantes em {MESES[mesSelecionado]}
        </Badge>
        
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <Button variant="default" className="flex items-center gap-2" onClick={abrirModal}>
            <UserPlus size={16} />
            <span>Adicionar Aniversariante</span>
          </Button>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Aniversariante</DialogTitle>
            </DialogHeader>
            
            <FormAniversariante 
              onSubmit={handleAdicionarAniversariante}
              onCancel={fecharModal}
              isSubmitting={adicionando}
              departamentos={DEPARTAMENTOS}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Estado de carregamento */}
      {carregando ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      ) : (
        <ListaAniversariantes 
          aniversariantes={aniversariantesFiltrados}
          mesSelecionado={mesSelecionado}
          onRemover={removerAniversariante}
          onAdicionar={abrirModal}
          meses={MESES}
        />
      )}
    </div>
  );
};

export default AniversariantesDoMes;