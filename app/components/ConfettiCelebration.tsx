import React, { useState, useEffect, useRef } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '../hooks/useWindowSize';

interface ConfettiCelebrationProps {
  active?: boolean;
  duration?: number;
  recycle?: boolean;
  numberOfPieces?: number;
  onComplete?: () => void;
}

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  active = true,
  duration = 5000,
  recycle = false,
  numberOfPieces = 500,
  onComplete
}) => {
  const [isActive, setIsActive] = useState(active);
  const [pieces, setPieces] = useState(numberOfPieces);
  const { width, height } = useWindowSize();
  const hasCalledOnComplete = useRef(false);
  
  // Reset state when active changes
  useEffect(() => {
    if (active) {
      setIsActive(true);
      setPieces(numberOfPieces);
      hasCalledOnComplete.current = false;
    }
  }, [active, numberOfPieces]);
  
  // Track pieces for completion
  const handleConfettiComplete = () => {
    // This is triggered when all confetti pieces have fallen off the screen
    if (isActive && !recycle && !hasCalledOnComplete.current) {
      hasCalledOnComplete.current = true;
      setIsActive(false);
      if (onComplete) onComplete();
    }
  };
  
  // Handle piece count updates
  const handlePiecesUpdate = (pieces: number) => {
    setPieces(pieces);
    
    // When the last piece disappears, call the complete handler
    if (pieces === 0 && !recycle && !hasCalledOnComplete.current) {
      handleConfettiComplete();
    }
  };
  
  // Cores vibrantes para os confetes (cores de festa)
  const colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', 
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', 
    '#009688', '#4caf50', '#8bc34a', '#cddc39', 
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
  ];
  
  // Calcular dimensões ligeiramente menores para evitar overflow
  const confettiWidth = Math.max(width - 10, 0); // Subtrai 10px para segurança
  const confettiHeight = Math.max(height - 10, 0); // Subtrai 10px para segurança
  
  if (!isActive) return null;
  
  return (
    <div className="confetti-container" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none', // Importante para permitir cliques através dos confetes
      zIndex: 100,
      overflow: 'hidden' // Impede barras de rolagem
    }}>
      <Confetti
        width={confettiWidth}
        height={confettiHeight}
        recycle={recycle}
        numberOfPieces={numberOfPieces}
        colors={colors}
        gravity={0.15}
        tweenDuration={duration}
        onConfettiComplete={handleConfettiComplete}
        run={isActive}
        confettiSource={{
          x: confettiWidth/2,
          y: 0,
          w: 0,
          h: 0
        }}
      />
    </div>
  );
};

// Hook para uso fácil do confete com Promise
export const useConfettiCelebration = () => {
  const [showConfetti, setShowConfetti] = useState(false);
  
  const triggerConfetti = (options = {}) => {
    return new Promise<void>((resolve) => {
      setShowConfetti(true);
      
      const handleComplete = () => {
        setShowConfetti(false);
        resolve();
      };
      
      // Armazenar o callback para ser usado pelo componente
      (window as any).__confettiCompleteCallback = handleComplete;
    });
  };
  
  const ConfettiComponent = (props: Omit<ConfettiCelebrationProps, 'active' | 'onComplete'>) => {
    if (!showConfetti) return null;
    
    return (
      <ConfettiCelebration
        {...props}
        active={showConfetti}
        onComplete={() => (window as any).__confettiCompleteCallback?.()}
      />
    );
  };
  
  return { triggerConfetti, ConfettiComponent };
};