// componentes/ListaAniversariantes.tsx
import React from 'react';
import { Cake, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardAniversariante } from './CardAniversariante';
import type { Aniversariante } from '../hooks/useAniversariantes';
import { obterDia } from '../utils/aniversariantesUtils';

interface ListaAniversariantesProps {
  aniversariantes: Aniversariante[];
  mesSelecionado: number;
  onRemover: (id: string) => Promise<boolean>;
  onAdicionar: () => void;
  meses: string[];
}

export const ListaAniversariantes: React.FC<ListaAniversariantesProps> = ({
  aniversariantes,
  mesSelecionado,
  onRemover,
  onAdicionar,
  meses
}) => {
  // Se não houver aniversariantes, mostrar mensagem
  if (aniversariantes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="mb-4 text-gray-400">
          <Cake size={48} />
        </div>
        <h3 className="text-xl font-medium mb-2">Nenhum aniversariante encontrado</h3>
        <p className="text-gray-500 text-center mb-6">
          Não há aniversariantes registrados para o mês de {meses[mesSelecionado]}.
        </p>
        <Button className="flex items-center gap-2" onClick={onAdicionar}>
          <UserPlus size={16} />
          <span>Adicione um aniversariante</span>
        </Button>
      </div>
    );
  }
  
  // Ordenar aniversariantes pelo dia
  const aniversariantesOrdenados = [...aniversariantes].sort(
    (a, b) => obterDia(a.data) - obterDia(b.data)
  );
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {aniversariantesOrdenados.map((aniversariante) => (
        <CardAniversariante 
          key={aniversariante.id} 
          aniversariante={aniversariante} 
          onRemover={onRemover} 
        />
      ))}
    </div>
  );
};