import type { Aniversariante } from "~/hooks/useAniversariantes";

// utils/aniversariantesUtils.ts
export const obterDia = (data: string): number => {
  if (!data) return 0;
  return parseInt(data.split('/')[0], 10);
};

export const obterIniciais = (nome: string): string => {
  if (!nome) return '';
  const partes = nome.split(' ');
  if (partes.length > 1) {
    return `${partes[0][0]}${partes[1][0]}`;
  }
  return partes[0][0];
};

export const obterCorAvatar = (nome: string): string => {
  if (!nome) return 'bg-gray-400';
  
  const cores = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  
  // Gera um número baseado na soma dos códigos ASCII dos caracteres do nome
  const soma = nome.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return cores[soma % cores.length];
};

export const enviarEmail = (aniversariante: Aniversariante) => {
  if (!aniversariante.email) return;
  
  // Criar o assunto e corpo do email
  const assunto = `Feliz Aniversário, ${aniversariante.nome}!`;
  const corpo = `Olá ${aniversariante.nome},\n\nDesejamos a você um feliz aniversário e um dia repleto de alegrias!\n\nAtenciosamente,\nEquipe da Empresa`;
  
  // Abrir o cliente de email padrão
  window.open(`mailto:${aniversariante.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`);
  
  return true;
};
