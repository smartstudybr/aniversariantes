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

// E adicione esta função no seu componente:
const getBadgeColor = (dep: string | undefined) => {
  // Extrair o número do RCDC (assumindo formato "RCDC1", "RCDC2", etc.)
  if (!dep) return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"; // Padrão
  const match = dep.match(/RCDC(\d+)/);
  
  if (!match) return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"; // Padrão
  
  const rcdc = parseInt(match[1]);
  
  // Mapa de cores para cada número de RCDC (evitando tons de rosa)
  const colorMap: { [key: number]: string } = {
    0: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300", // Azul
    1: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300", // Roxo
    2: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300", // Verde esmeralda
    3: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300", // Âmbar
    4: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300", // Ciano
    5: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300", // Laranja
    6: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300", // Turquesa
    7: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300", // Índigo
    8: "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300", // Lima
    9: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300", // Céu
  };

  return colorMap[rcdc] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
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
  const emailAddress = {aniversariante}; // Replace with actual recipient email address
  const subject = "Feliz Aniversário!";
  const body = `Mensagem para ${aniversariante.nome} está aberta no seu cliente de e-mail.`;

  // Construct the mailto link with subject and body
  const mailtoLink = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Open the default mail client
  window.location.href = mailtoLink;

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
      <Card
        className={`relative hover:shadow-lg transition-shadow ${
          ehAniversarioHoje ? "ring-2 ring-pink-400 shadow-xl" : ""
        }`}
      >
        {ehAniversarioHoje && (
          <div className="absolute -right-2 -top-2 transform rotate-12 z-10 pointer-events-none">
            {/* <PartyPopper className="h-8 w-8 text-pink-500" /> */}
            <img
              src="/cake.png"
              alt="Bolo"
              className="h-58 w-auto scale-x-[-1] -rotate-12 animate-[twerk_10s_infinite]"
            />
          </div>
        )}
        <CardHeader>
          <div className="flex justify-between items-center gap-2">
            <Badge variant="outline" className="w-20 py-1 text-xl">{aniversariante.data}</Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-red-500"
              onClick={abrirDialogConfirmacao}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex items-center gap-4">
          {/* Larger Image */}
          <div className="w-full flex">
            <div
              className={`${
                aniversariante.foto ? "" : obterCorAvatar(aniversariante.nome)
              } overflow-hidden w-20 h-20 shrink-0 rounded-sm flex items-center justify-center text-white text-xl font-bold  ${
                ehAniversarioHoje ? "ring-2 ring-pink-300" : ""
              }`}
            >
              {aniversariante.foto ? (
                <img
                  src={aniversariante.foto}
                  alt={aniversariante.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                obterIniciais(aniversariante.nome)
              )}
            </div>

            {/* Name, Department, and Email */}
            <div className="flex flex-col justify-center ml-4 w-full overflow-hidden">
              {ehAniversarioHoje && (
                  <Badge className=" bg-pink-500 animate-pulse">
                    Hoje!
                  </Badge>
                )}
              <p className="text-md truncate font-semibold text-gray-800">
                {aniversariante.nome}
                
              </p>
              <Badge 
                className={`text-xs font-medium ${getBadgeColor(aniversariante.departamento)}`}
              >
                {aniversariante.departamento}
              </Badge>
              {aniversariante.email && (
                <p className="cursor-pointer truncate text-xs text-gray-400 mt-1" onClick={handleEnviarEmail}>
                  {aniversariante.email}
                </p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter
          className={`py-2 rounded-b-xl bg-gray-50 dark:bg-gray-800 ${
            ehAniversarioHoje ? "bg-pink-50 dark:bg-pink-900/30" : ""
          }`}
        >
          <div className="w-full flex justify-center">
            <Button
              variant="link"
              className={`flex items-center gap-2 text-sm transition-colors ${
                emailButtonAnimation ? "animate-bounce" : ""
              } ${
                ehAniversarioHoje
                  ? "text-pink-600 hover:text-pink-800 hover:bg-pink-100"
                  : "text-pink-500 hover:text-pink-700"
              }`}
              onClick={handleEnviarEmail}
              disabled={!aniversariante.email}
            >
              {ehAniversarioHoje ? (
                <PartyPopper size={16} />
              ) : (
                <Mail size={16} />
              )}
              <span>
                {aniversariante.email
                  ? ehAniversarioHoje
                    ? "Desejar parabéns!"
                    : "Enviar mensagem"
                  : `${aniversariante.nome} não deixou email...`}
              </span>
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