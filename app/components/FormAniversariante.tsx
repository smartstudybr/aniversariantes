// componentes/FormAniversariante.tsx
import React, { useState, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { toastError } from '@/components/ui/sonner';
import type { NovoAniversariante } from '../hooks/useAniversariantes';

interface FormAniversarianteProps {
  onSubmit: (dados: NovoAniversariante, arquivo: File | null) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  departamentos: string[];
}

export const FormAniversariante: React.FC<FormAniversarianteProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
  departamentos
}) => {
  // Estado para o novo aniversariante
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
  
  // Referência para o input de arquivo
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Manipulador para mudança de campos do formulário
  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setNovoAniversariante({
      ...novoAniversariante,
      [name]: value
    });
  };
  
  // Manipulador para upload de imagem
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
  
  // Manipulador para mudança de departamento
  const handleDepartamentoChange = (value: string) => {
    setNovoAniversariante(prev => ({
      ...prev,
      departamento: value
    }));
  };
  
  // Manipulador para submit do formulário
  const handleSubmit = async () => {
    await onSubmit(novoAniversariante, selectedFile);
  };
  
  return (
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
        <div className="w-full">
          <Input
            id="foto"
            type="file"
            accept="image/*"
            ref={inputRef}
            className="w-full cursor-pointer"
            onChange={handleImageUpload}
            style={{ display: 'none' }} // Esconder o input real
          />
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={() => inputRef.current?.click()}
          >
            Selecionar imagem
          </Button>
          <p className="text-xs text-gray-500 mt-1 text-center">Tamanho máximo: 2MB</p>
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
          <Label htmlFor="departamento">Departamento *</Label>
          <Select
            value={novoAniversariante.departamento}
            onValueChange={handleDepartamentoChange}
            required
          >
            <SelectTrigger className="w-full cursor-pointer">
              <SelectValue placeholder="Selecione o departamento" />
            </SelectTrigger>
            <SelectContent>
              {departamentos.map((dep) => (
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
      
      <div className="flex justify-end gap-3 mt-4">
        <Button 
          variant="outline" 
          onClick={onCancel} 
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="relative"
        >
          {isSubmitting ? (
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
      </div>
    </div>
  );
};