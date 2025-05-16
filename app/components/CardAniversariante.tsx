// componentes/CardAniversariante.tsx (Atualizado com lançamento de confetes)
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Trash2, PartyPopper } from 'lucide-react';
import type { Aniversariante } from '../hooks/useAniversariantes';
import { obterCorAvatar, obterDia, obterIniciais, enviarEmail } from '../utils/aniversariantesUtils';
import { toastInfo } from '@/components/ui/sonner';
import { DialogConfirmacao } from './DialogConfirmacao';

interface CardAniversarianteProps {
  aniversariante: Aniversariante;
  onRemover: (id: string) => Promise<boolean>;
}

export const CardAniversariante: React.FC<CardAniversarianteProps> = React.memo(({
  aniversariante,
  onRemover
}) => {
  // Estado para controlar o diálogo de confirmação
  const [confirmDialogAberto, setConfirmDialogAberto] = useState(false);
  // Estado para animação de clique no botão de email
  const [emailButtonAnimation, setEmailButtonAnimation] = useState(false);
  
  const handleEnviarEmail = () => {
    const enviado = enviarEmail(aniversariante);
    if (enviado) {
      // Disparar evento de confete
      window.dispatchEvent(new Event('triggerConfetti'));
      
      // Animar o botão
      setEmailButtonAnimation(true);
      setTimeout(() => setEmailButtonAnimation(false), 1000);
      
      // Mostrar toast com ícone festivo
      toastInfo(
        'Email aberto',
        `Mensagem para ${aniversariante.nome} aberta no seu cliente de email`
      );
    }
  };
  
  // Função para abrir o diálogo de confirmação
  const abrirDialogConfirmacao = () => {
    setConfirmDialogAberto(true);
  };
  
  // Função para fechar o diálogo sem ação
  const fecharDialogConfirmacao = () => {
    setConfirmDialogAberto(false);
  };
  
  // Função para confirmar a remoção
  const confirmarRemocao = async () => {
    const removido = await onRemover(aniversariante.id);
    if (removido) {
      setConfirmDialogAberto(false);
    }
  };
  
  // Verificar se hoje é o aniversário da pessoa
  const isAniversarioHoje = () => {
    if (!aniversariante.data) return false;
    
    const hoje = new Date();
    const [dia, mes] = aniversariante.data.split('/').map(Number);
    
    return dia === hoje.getDate() && (mes - 1) === hoje.getMonth();
  };
  
  const ehAniversarioHoje = isAniversarioHoje();
  
  return (
    <>
      <Card className={`relative overflow-hidden hover:shadow-lg transition-shadow ${ehAniversarioHoje ? 'ring-2 ring-pink-400 shadow-lg' : ''}`}>
        {ehAniversarioHoje && (
          <div className="absolute right-16 top-16 transform rotate-12">
            <PartyPopper className="h-8 w-8 text-pink-500" />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">
              {aniversariante.nome}
              {ehAniversarioHoje && (
                <Badge className="ml-2 bg-pink-500 animate-pulse">Hoje!</Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Badge className="bg-pink-500">{aniversariante.data}</Badge>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-gray-400 hover:text-red-500" 
                onClick={abrirDialogConfirmacao}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
          <CardDescription>{aniversariante.departamento}</CardDescription>
        </CardHeader>
        
        <CardContent className="flex items-center gap-4 pt-0">
          <div className={`${aniversariante.foto ? '' : obterCorAvatar(aniversariante.nome)} w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold overflow-hidden ${ehAniversarioHoje ? 'ring-2 ring-pink-300' : ''}`}>
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
        
        <CardFooter className={`bg-gray-50 dark:bg-gray-800 ${ehAniversarioHoje ? 'bg-pink-50 dark:bg-pink-900/30' : ''}`}>
          <div className="w-full flex justify-center">
            <Button 
              variant="ghost" 
              className={`flex items-center gap-2 text-sm transition-colors ${emailButtonAnimation ? 'animate-bounce' : ''} ${
                ehAniversarioHoje 
                  ? 'text-pink-600 hover:text-pink-800 hover:bg-pink-100' 
                  : 'text-pink-500 hover:text-pink-700'
              }`}
              onClick={handleEnviarEmail}
              disabled={!aniversariante.email}
            >
              {ehAniversarioHoje ? <PartyPopper size={16} /> : <Mail size={16} />}
              <span>{ehAniversarioHoje ? 'Desejar parabéns!' : 'Enviar mensagem'}</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Diálogo de confirmação de exclusão */}
      <DialogConfirmacao
        aberto={confirmDialogAberto}
        titulo="Confirmar exclusão"
        descricao={`Tem certeza que deseja remover ${aniversariante.nome} da lista de aniversariantes? Esta ação não pode ser desfeita.`}
        onConfirmar={confirmarRemocao}
        onCancelar={fecharDialogConfirmacao}
      />
    </>
  );
});