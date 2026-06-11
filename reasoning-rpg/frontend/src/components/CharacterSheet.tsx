import React from 'react';
import { CharacterDetail } from '../services/api';

interface Props {
  character: CharacterDetail;
  onUseItem: (charId: string, item: string) => void;
}

function HealthBar({ current, max }: { current: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const color = pct > 60 ? '#4a7' : pct > 30 ? '#ca4' : '#c44';
  return (
    <div className="health-bar-bg">
      <div className="health-bar-fill" style={{ width: `${pct}%`, background: color }} />
      <span className="health-bar-text">{current}/{max}</span>
    </div>
  );
}

function StaminaBar({ current, max }: { current: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  return (
    <div className="stamina-bar-bg">
      <div className="stamina-bar-fill" style={{ width: `${pct}%` }} />
      <span className="health-bar-text">{current}/{max}</span>
    </div>
  );
}

function ExpBar({ current }: { current: number }) {
  const nextLevel = 100;
  const pct = Math.min(100, (current / nextLevel) * 100);
  return (
    <div className="exp-bar-bg">
      <div className="exp-bar-fill" style={{ width: `${pct}%` }} />
      <span className="health-bar-text">{current}/{nextLevel} XP</span>
    </div>
  );
}

export default function CharacterSheet({ character, onUseItem }: Props) {
  const roleColors: Record<string, string> = {
    Warrior: '#c44', Mage: '#44a', Rogue: '#4a4', Healer: '#ca4', Rival: '#a4c',
  };

  return (
    <div className="character-card" style={{ borderColor: roleColors[character.role] || '#555' }}>
      <div className="char-header" style={{ background: roleColors[character.role] || '#555' }}>
        <strong>{character.name}</strong>
        <span className="char-role">{character.role}</span>
        <span className="char-level">Lv.{character.level}</span>
      </div>
      <div className="char-body">
        <div className="char-stat">
          <label>HP</label>
          <HealthBar current={character.health} max={character.max_health} />
        </div>
        <div className="char-stat">
          <label>ST</label>
          <StaminaBar current={character.stamina} max={character.max_stamina} />
        </div>
        <ExpBar current={character.experience} />
        <div className="char-abilities">
          {Object.entries(character.abilities).map(([k, v]) => (
            <span key={k} className="ability-badge">{k}: {v > 0 ? '+' : ''}{v}</span>
          ))}
        </div>
        {character.conditions.length > 0 && (
          <div className="char-conditions">
            {character.conditions.map(c => <span key={c} className="condition-badge">{c}</span>)}
          </div>
        )}
        {character.role !== 'Rival' && (
          <div className="char-inventory">
            <label>Inventory ({character.inventory.length})</label>
            <div className="inv-grid">
              {character.inventory.map(item => (
                <span key={item} className="inv-item" onClick={() => onUseItem(character.id, item)} title="Use item">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
