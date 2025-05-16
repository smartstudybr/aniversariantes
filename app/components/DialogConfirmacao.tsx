// componentes/DialogConfirmacao.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangleIcon } from 'lucide-react';

interface DialogConfirmacaoProps {
  aberto: boolean;
  titulo: string;
  descricao: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export const DialogConfirmacao: React.FC<DialogConfirmacaoProps> = ({
  aberto,
  titulo,
  descricao,
  onConfirmar,
  onCancelar
}) => {
  return (
    <Dialog open={aberto} onOpenChange={(open) => {
      if (!open) onCancelar();
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex gap-2">
          <div className="flex items-center gap-3">
            <AlertTriangleIcon className="h-6 w-6 text-red-500" />
            <DialogTitle>{titulo}</DialogTitle>
          </div>
          <DialogDescription>
            {descricao}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirmar}>
            Confirmar exclusão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};