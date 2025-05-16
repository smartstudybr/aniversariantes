// AniversariantesDoMes.tsx (Atualizado com Confetti)
import React, { useState, useCallback, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Cake, Calendar, UserPlus, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormAniversariante } from '@/components/FormAniversariante';
import { ListaAniversariantes } from '@/components/ListaAniversariantes';
import { useAniversariantes, type NovoAniversariante } from '@/hooks/useAniversariantes';
import { toastInfo, toast } from '@/components/ui/sonner';
import { ConfettiCelebration } from '@/components/ConfettiCelebration';

// Lista de meses em português
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const DEPARTAMENTOS = ['RCDC1','RCDC2','RCDC3','RCDC4','RCDC5','RCDC6','RCDC7','RCDC8','RCDC9','RCDC0'];

// Evento global para lançar confetes (pode ser chamado de qualquer lugar)
export const triggerConfetti = new Event('triggerConfetti');

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
  
  // Estados para controlar os confetes
  const [showInitialConfetti, setShowInitialConfetti] = useState(false);
  const [showActionConfetti, setShowActionConfetti] = useState(false);
  
  // Função para lidar com a adição de novo aniversariante
  const handleAdicionarAniversariante = useCallback(async (
    dadosAniversariante: NovoAniversariante, 
    arquivo: File | null
  ) => {
    const sucesso = await adicionarAniversariante(dadosAniversariante, arquivo);
    if (sucesso) {
      setModalAberto(false);
      
      // Lançar confetes ao adicionar com sucesso
      setShowActionConfetti(true);
      
      // Mostrar APENAS o toast festivo rosa (removendo o toast padrão verde)
      toast.custom((t) => (
        <div className="bg-pink-50 border-pink-200 text-pink-800 px-4 py-3 rounded-md shadow-lg border flex items-center gap-3 -mb-2 -mt-0.5">
          <PartyPopper className="w-5 h-5 text-pink-500" />
          <div>
            <div className="font-semibold">Aniversariante adicionado!</div>
            <div className="text-sm text-pink-600">Novo aniversariante cadastrado com sucesso</div>
          </div>
        </div>
      ), { duration: 4000, id: 'aniversariante-adicionado' });
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
  
  // Efeito para mostrar confetes na carga inicial
  useEffect(() => {
    // Se tiver aniversariantes no mês atual, mostrar confetes
    if (!carregando && aniversariantesFiltrados.length > 0) {
      setShowInitialConfetti(true);
    }
    
    // Configurar listener para eventos de confete
    const handleConfettiEvent = () => {
      setShowActionConfetti(true);
    };
    
    window.addEventListener('triggerConfetti', handleConfettiEvent);
    
    return () => {
      window.removeEventListener('triggerConfetti', handleConfettiEvent);
    };
  }, [carregando, aniversariantesFiltrados]);
  
  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Confete inicial ao carregar a página */}
      <ConfettiCelebration 
        active={showInitialConfetti} 
        duration={5000}
        numberOfPieces={150}
        onComplete={() => setShowInitialConfetti(false)}
      />
      
      {/* Confete para ações como adicionar aniversariante */}
      <ConfettiCelebration 
        active={showActionConfetti} 
        duration={3000}
        numberOfPieces={120}
        onComplete={() => setShowActionConfetti(false)}
      />
      
      <div className="flex flex-col items-center mb-8 relative">
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
          <Cake size={28} className="text-pink-500" />
          <h1 className="text-3xl font-bold text-center">Aniversariantes do Mês</h1>
        </div>
        <p className="text-gray-500 mb-6">Celebre com nossos colegas!</p>
        
        {/* Seletor de mês */}
        <div className="w-full max-w-xs bg-white">
          <Select 
            value={mesSelecionado.toString()} 
            onValueChange={(value) => {
              setMesSelecionado(parseInt(value, 10));
              
              // Lançar confetes ao mudar de mês, se houver aniversariantes
              const novoMes = parseInt(value, 10);
              const tempAniv = aniversariantesFiltrados.filter(a => {
                const mes = parseInt(a.data.split('/')[1]) - 1;
                return mes === novoMes;
              });
              
              if (tempAniv.length > 0) {
                setShowActionConfetti(true);
              }
            }}
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