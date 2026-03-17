import { useEffect, useState } from 'react';

interface DangerWarningProps {
  show: boolean;
}

export default function DangerWarning({ show }: DangerWarningProps) {
  const [visible, setVisible] = useState(false);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      setPulsing(true);

      // Parpadear cada 2 segundos
      const interval = setInterval(() => {
        setPulsing(prev => !prev);
      }, 500);

      return () => clearInterval(interval);
    } else {
      setVisible(false);
      setPulsing(false);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div className={`danger-warning ${pulsing ? 'pulse' : ''}`}>
      <span className="danger-icon">⚠️</span>
      <span className="danger-text">¡CUIDADO!</span>
    </div>
  );
}
