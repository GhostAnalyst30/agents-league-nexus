import React, { useState } from 'react';
import { ExitInfo } from '../services/api';
import { LogEntry } from '../hooks/useGame';

interface Props {
  log: LogEntry[];
  loading: boolean;
  inCombat: boolean;
  exits: ExitInfo[];
  characters: Record<string, any>;
  location: { npcs: string[]; items: string[] } | null;
  onMove: (dir: string) => void;
  onSearch: () => void;
  onTalk: (npc: string) => void;
  onAction: (action: string, targetId?: string) => void;
  onRest: (long: boolean) => void;
  onSave: () => void;
  onClearLog: () => void;
}

export default function ActionPanel({
  log, loading, inCombat, exits, characters, location,
  onMove, onSearch, onTalk, onAction, onRest, onSave, onClearLog,
}: Props) {
  const [showAll, setShowAll] = useState(false);

  const visibleLog = showAll ? log : log.slice(-20);
  const colorMap: Record<string, string> = {
    narrative: '#aaa', combat: '#c66', system: '#6a8', loot: '#ca4',
    move: '#68a', quest: '#6ac', roll: '#a8c', dialog: '#a8a',
  };

  return (
    <div className="action-panel">
      <div className="action-toolbar">
        <button className="btn-toolbar" onClick={() => setShowAll(!showAll)} disabled={loading}>
          {showAll ? '📋 Recent' : '📋 All'}
        </button>
        <button className="btn-toolbar" onClick={onClearLog} disabled={loading}>🗑 Clear</button>
        <button className="btn-toolbar" onClick={() => onRest(false)} disabled={loading || inCombat}>
          🛏 Short Rest
        </button>
        <button className="btn-toolbar" onClick={() => onRest(true)} disabled={loading || inCombat}>
          🏕 Long Rest
        </button>
        <button className="btn-toolbar" onClick={onSave} disabled={loading}>💾 Save</button>
      </div>

      <div className="game-log">
        {visibleLog.length === 0 && (
          <div className="log-welcome">
            <h2>Welcome to Eldervale</h2>
            <p>The adventure begins. Use the map to explore, or type an action below.</p>
          </div>
        )}
        {visibleLog.map(entry => (
          <div key={entry.id} className="log-entry" style={{ borderLeftColor: colorMap[entry.type] || '#555' }}>
            {entry.text}
          </div>
        ))}
      </div>
    </div>
  );
}
