// componentes/CardAniversariante.tsx (Atualizado com Dialog de confirmação)
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Trash2 } from 'lucide-react';
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
  
  const handleEnviarEmail = () => {
    const enviado = enviarEmail(aniversariante);
    if (enviado) {
      toastInfo('Email aberto', 
        `Email para ${aniversariante.nome} aberto no seu cliente de email`);
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
  
  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{aniversariante.nome}</CardTitle>
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
              onClick={handleEnviarEmail}
              disabled={!aniversariante.email}
            >
              <Mail size={16} />
              <span>Enviar mensagem</span>
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