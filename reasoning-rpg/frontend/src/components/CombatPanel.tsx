import React, { useState } from 'react';
import { CombatInfo, CharacterDetail } from '../services/api';

interface Props {
  combat: CombatInfo;
  characters: Record<string, CharacterDetail>;
  onAction: (action: string, targetId?: string) => void;
  onFlee: () => void;
  loading: boolean;
}

export default function CombatPanel({ combat, characters, onAction, onFlee, loading }: Props) {
  const [selectedAction, setSelectedAction] = useState<string>('attack');
  const [selectedTarget, setSelectedTarget] = useState<string>('');

  if (!combat?.in_combat) return null;

  const currentTurn = combat.current_turn || '';
  const isPlayerTurn = currentTurn.startsWith('party:');
  const turnOwner = currentTurn.split(':')[1];
  const turnChar = characters[turnOwner];

  const aliveEnemies = combat.enemies ? Object.entries(combat.enemies).filter(([, e]) => e.health > 0) : [];
  const aliveParty = combat.party ? Object.entries(combat.party).filter(([, p]) => p.health > 0) : [];

  return (
    <div className="combat-panel">
      <div className="combat-header">
        <span className="combat-title">⚔ COMBAT - Round {combat.turn_number}</span>
        <span className="combat-turn">
          {isPlayerTurn ? `🎯 ${turnChar?.name || turnOwner}'s Turn` : `👾 Enemy Turn`}
        </span>
      </div>

      <div className="combat-body">
        <div className="combat-enemies">
          <h4>Enemies</h4>
          {aliveEnemies.map(([id, e]) => (
            <div key={id} className={`enemy-unit ${selectedTarget === id ? 'selected' : ''}`}
                 onClick={() => setSelectedTarget(id)}>
              <span className="enemy-name">{e.name}</span>
              <div className="health-bar-bg" style={{ width: '100%' }}>
                <div className="health-bar-fill" style={{
                  width: `${(e.health / e.max_health) * 100}%`,
                  background: e.health > e.max_health * 0.3 ? '#c44' : '#a22'
                }} />
                <span className="health-bar-text">{e.health}/{e.max_health}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="combat-party">
          <h4>Party</h4>
          {aliveParty.map(([id, p]) => (
            <div key={id} className={`party-unit ${selectedTarget === id ? 'selected' : ''}`}
                 onClick={() => setSelectedTarget(id)}>
              <span className="party-name">{p.name}</span>
              <div className="health-bar-bg" style={{ width: '100%' }}>
                <div className="health-bar-fill" style={{
                  width: `${(p.health / p.max_health) * 100}%`,
                  background: p.health > p.max_health * 0.3 ? '#4a7' : '#a22'
                }} />
                <span className="health-bar-text">{p.health}/{p.max_health}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isPlayerTurn && (
        <div className="combat-actions">
          <div className="action-buttons">
            <button className={`btn-action ${selectedAction === 'attack' ? 'active' : ''}`}
                    onClick={() => setSelectedAction('attack')} disabled={loading}>⚔ Attack</button>
            <button className={`btn-action ${selectedAction === 'magic' ? 'active' : ''}`}
                    onClick={() => setSelectedAction('magic')} disabled={loading}>✨ Magic</button>
            <button className={`btn-action ${selectedAction === 'heal' ? 'active' : ''}`}
                    onClick={() => setSelectedAction('heal')} disabled={loading}>💚 Heal</button>
            <button className={`btn-action ${selectedAction === 'defend' ? 'active' : ''}`}
                    onClick={() => setSelectedAction('defend')} disabled={loading}>🛡 Defend</button>
            <button className={`btn-action ${selectedAction === 'sneak' ? 'active' : ''}`}
                    onClick={() => setSelectedAction('sneak')} disabled={loading}>👤 Sneak</button>
          </div>
          <div className="action-execute">
            <button className="btn-execute" onClick={() => onAction(selectedAction, selectedTarget || undefined)}
                    disabled={loading || (selectedAction !== 'defend' && !selectedTarget)}>
              {loading ? '⏳ Executing...' : '▶ Execute'}
            </button>
            <button className="btn-flee" onClick={onFlee} disabled={loading}>🏃 Flee</button>
          </div>
        </div>
      )}

      {combat.log && combat.log.length > 0 && (
        <div className="combat-log">
          {combat.log.slice(-5).map((entry, i) => (
            <div key={i} className="combat-log-entry">{entry}</div>
          ))}
        </div>
      )}
    </div>
  );
}
