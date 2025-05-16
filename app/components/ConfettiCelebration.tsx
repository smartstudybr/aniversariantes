// componentes/ConfettiCelebration.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/useWindowSize';

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
  numberOfPieces = 200,
  onComplete
}) => {
  const [isActive, setIsActive] = useState(active);
  const { width, height } = useWindowSize();
  
  // Desativar os confetes após a duração, se especificada
  useEffect(() => {
    setIsActive(active);
    
    if (active && duration && !recycle) {
      const timer = setTimeout(() => {
        setIsActive(false);
        if (onComplete) onComplete();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [active, duration, recycle, onComplete]);
  
  // Cores vibrantes para os confetes (cores de festa)
  const colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7', 
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', 
    '#009688', '#4caf50', '#8bc34a', '#cddc39', 
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
  ];
  
  return isActive ? (
    <Confetti
      width={width}
      height={height}
      recycle={recycle}
      numberOfPieces={numberOfPieces}
      colors={colors}
      gravity={0.15}
      tweenDuration={duration}
    />
  ) : null;
};