import React from 'react';
import { CharacterDetail } from '../services/api';

interface Props {
  characters: Record<string, CharacterDetail>;
  onUseItem: (charId: string, item: string, targetId?: string) => void;
  loading: boolean;
}

export default function InventoryPanel({ characters, onUseItem, loading }: Props) {
  const partyChars = Object.values(characters).filter(c => c.role !== 'Rival');

  return (
    <div className="inventory-panel">
      <h4>🎒 Inventory</h4>
      {partyChars.map(char => (
        <div key={char.id} className="inv-character">
          <strong>{char.name}</strong>
          {char.inventory.length === 0 ? (
            <span className="inv-empty">Empty</span>
          ) : (
            <div className="inv-items">
              {char.inventory.map(item => (
                <span key={item} className="inv-item-card">
                  {item}
                  <button className="btn-tiny" onClick={() => onUseItem(char.id, item)}
                          disabled={loading}>Use</button>
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
