import React, { useState, useEffect } from 'react';

interface Props {
  result?: { roll: number; total: number; modifier: number; result: string } | null;
  onClose: () => void;
}

const faces: Record<string, string> = {
  critical_success: '🎉 CRITICAL!',
  success: '✅ Success',
  partial_success: '⚠ Partial',
  failure: '❌ Failure',
  critical_failure: '💀 FUMBLE!',
};

const faceColors: Record<string, string> = {
  critical_success: '#4a7', success: '#6a8', partial_success: '#ca4',
  failure: '#c66', critical_failure: '#c22',
};

export default function DiceRoll({ result, onClose }: Props) {
  const [animating, setAnimating] = useState(false);
  const [displayRoll, setDisplayRoll] = useState<number | null>(null);

  useEffect(() => {
    if (result) {
      setAnimating(true);
      let count = 0;
      const interval = setInterval(() => {
        setDisplayRoll(Math.floor(Math.random() * 20) + 1);
        count++;
        if (count >= 8) {
          clearInterval(interval);
          setDisplayRoll(result.roll);
          setAnimating(false);
        }
      }, 80);
      return () => clearInterval(interval);
    }
  }, [result]);

  if (!result) return null;

  const face = faces[result.result] || result.result;
  const color = faceColors[result.result] || '#888';

  return (
    <div className="dice-overlay" onClick={onClose}>
      <div className="dice-modal" onClick={e => e.stopPropagation()}>
        <div className="dice-display">
          <div className={`d20 ${animating ? 'spinning' : ''}`} style={{ borderColor: color }}>
            <span className="dice-number">{displayRoll || result.roll}</span>
          </div>
        </div>
        <div className="dice-details">
          <span className="dice-formula">d20 + {result.modifier}</span>
          <span className="dice-total" style={{ color }}>Total: {result.total}</span>
          <span className={`dice-result`} style={{ color }}>{face}</span>
        </div>
        <button className="btn-dice-close" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}
