// hooks/useWindowSize.ts
import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  // Estado inicial com dimensões padrão
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    // Handler para atualizar dimensões da janela
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    // Adicionar event listener
    window.addEventListener('resize', handleResize);
    
    // Chamar handler para definir dimensões iniciais
    handleResize();
    
    // Limpar event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}