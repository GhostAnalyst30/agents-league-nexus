import React from 'react';
import { LocationInfo, ExitInfo } from '../services/api';

interface Props {
  location: LocationInfo | null;
  exits: ExitInfo[];
  onMove: (direction: string) => void;
  onSearch: () => void;
  onPickup: (charId: string, item: string) => void;
  characters: Record<string, any>;
  loading: boolean;
}

export default function MapView({ location, exits, onMove, onSearch, onPickup, characters, loading }: Props) {
  if (!location) return <div className="map-panel"><p>Loading location...</p></div>;

  const dirSymbols: Record<string, string> = { north: '↑', south: '↓', east: '→', west: '←' };

  return (
    <div className="map-panel">
      <div className="location-header">
        <h3>📍 {location.name}</h3>
        <span className="location-type">{location.type} · {location.region}</span>
      </div>
      <p className="location-desc">{location.description}</p>

      {exits.length > 0 && (
        <div className="exits-row">
          <label>Exits:</label>
          {exits.map(e => (
            <button key={e.direction} className="exit-btn" onClick={() => onMove(e.direction)} disabled={loading}>
              {dirSymbols[e.direction] || '?'} {e.name}
            </button>
          ))}
        </div>
      )}

      <div className="location-actions">
        <button className="btn-secondary" onClick={onSearch} disabled={loading}>🔍 Search</button>
        <button className="btn-secondary" onClick={() => onSearch()} disabled={loading}>🗺 Explore</button>
      </div>

      {location.items.length > 0 && (
        <div className="location-items">
          <label>Items on ground:</label>
          <div className="loot-row">
            {location.items.map(item => (
              <span key={item} className="loot-item">
                {item}
                <button className="btn-tiny" onClick={() => {
                  const firstChar = Object.keys(characters).find(c => characters[c]?.role !== 'Rival');
                  if (firstChar) onPickup(firstChar, item);
                }} disabled={loading}>Pick up</button>
              </span>
            ))}
          </div>
        </div>
      )}

      {location.npcs.length > 0 && (
        <div className="location-npcs">
          <label>NPCs:</label>
          <div className="npcs-row">
            {location.npcs.map(npc => (
              <span key={npc} className="npc-badge">{npc}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
