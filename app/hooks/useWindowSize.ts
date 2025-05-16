// hooks/useWindowSize.ts (versão corrigida)
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
      // Usa document.documentElement para obter o tamanho do viewport
      // em vez de window.innerWidth/Height que pode incluir barras de rolagem
      setWindowSize({
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
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