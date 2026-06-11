import React, { useState, useCallback } from 'react';
import { useGame, LogEntry } from './hooks/useGame';
import CharacterSheet from './components/CharacterSheet';
import CombatPanel from './components/CombatPanel';
import MapView from './components/MapView';
import QuestJournal from './components/QuestJournal';
import ActionPanel from './components/ActionPanel';
import DiceRoll from './components/DiceRoll';
import './App.css';

function App() {
  const {
    summary, location, exits, quests, combat, characters,
    log, loading, error, setError,
    move, search, talk, startCombat, combatAction, flee,
    useItem, pickupItem, rest, saveGame, loadGame, clearLog, addLog,
  } = useGame();

  const [diceResult, setDiceResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'party' | 'quests' | 'inventory'>('map');
  const [playerInput, setPlayerInput] = useState('');

  const handleAction = useCallback(async (action: string, targetId?: string) => {
    if (combat?.in_combat) {
      const result = await combatAction(action, targetId);
      if (result?.roll) setDiceResult(result.roll);
    }
  }, [combat, combatAction]);

  const handleFlee = useCallback(async () => {
    await flee();
  }, [flee]);

  const handleUseItem = useCallback(async (charId: string, item: string) => {
    const r = await useItem(charId, item);
    if (r?.healed) addLog('system', `Used ${item} on ${r.target}, healed ${r.healed} HP`);
  }, [useItem, addLog]);

  const handlePickupItem = useCallback(async (charId: string, item: string) => {
    await pickupItem(charId, item);
  }, [pickupItem]);

  const handleTalk = useCallback(async (npc: string) => {
    await talk(npc);
  }, [talk]);

  const handleSearch = useCallback(async () => {
    const result = await search();
    if (result?.roll) setDiceResult(result.roll);
  }, [search]);

  const handleCustomAction = useCallback(async () => {
    if (!playerInput.trim()) return;
    addLog('system', `> ${playerInput}`);

    const lower = playerInput.toLowerCase();
    if (lower.startsWith('go ') || lower.startsWith('move ') || lower.startsWith('travel ')) {
      const dir = lower.split(' ').pop() || '';
      await move(dir);
    } else if (lower.startsWith('talk to ') || lower.startsWith('speak to ')) {
      const npc = playerInput.slice(lower.startsWith('talk to ') ? 8 : 9).trim();
      await handleTalk(npc);
    } else if (lower.startsWith('use ')) {
      const item = playerInput.slice(4).trim();
      const firstChar = Object.values(characters).find(c => c.role !== 'Rival');
      if (firstChar) await handleUseItem(firstChar.id, item);
    } else if (lower.startsWith('pick up ') || lower.startsWith('take ')) {
      const item = playerInput.slice(lower.startsWith('pick up ') ? 8 : 5).trim();
      const firstChar = Object.values(characters).find(c => c.role !== 'Rival');
      if (firstChar) await handlePickupItem(firstChar.id, item);
    } else if (lower.includes('search') || lower.includes('look') || lower.includes('explore')) {
      await handleSearch();
    } else if (lower.includes('rest')) {
      const isLong = lower.includes('long');
      await rest(isLong);
    } else if (lower.startsWith('attack ') || lower.startsWith('hit ')) {
      const target = playerInput.split(' ').pop() || '';
      setActiveTab('party');
      if (combat?.in_combat) {
        const enemyTarget = Object.entries(combat.enemies || {}).find(([, e]) =>
          e.name.toLowerCase().includes(target.toLowerCase())
        );
        await combatAction('attack', enemyTarget?.[0]);
      }
    } else {
      addLog('narrative', `You try to ${playerInput}... (Use 'go north', 'search', 'talk to [npc]', 'use [item]')`);
    }
    setPlayerInput('');
  }, [playerInput, characters, combat, move, handleTalk, handleUseItem, handlePickupItem, handleSearch, rest, addLog, combatAction]);

  if (!summary) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <h1>🌙 Reasoning RPG</h1>
          <p className="loading-subtitle">The Shattered Moon of Eldervale</p>
          <div className="loading-bar"><div className="loading-fill" /></div>
          <p>Awakening the world...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <header className="game-header">
        <div className="header-left">
          <h1>🌙 {summary.campaign}</h1>
          <div className="header-info">
            <span>Turn {summary.turn}</span>
            <span className="header-sep">|</span>
            <span>📍 {summary.location.name}</span>
            <span className="header-sep">|</span>
            <span className={`phase-badge ${summary.phase}`}>
              {summary.phase === 'exploration' ? '🗺 Exploration' : '⚔ Combat'}
            </span>
          </div>
        </div>
        <div className="header-right">
          <button className="btn-header" onClick={() => saveGame()}>💾 Save</button>
          <button className="btn-header" onClick={clearLog}>🗑 Clear</button>
        </div>
      </header>

      <div className="game-layout">
        <aside className="sidebar-left">
          <div className="tab-bar">
            <button className={`tab ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>🗺 Map</button>
            <button className={`tab ${activeTab === 'party' ? 'active' : ''}`} onClick={() => setActiveTab('party')}>👥 Party</button>
            <button className={`tab ${activeTab === 'quests' ? 'active' : ''}`} onClick={() => setActiveTab('quests')}>📜 Quests</button>
            <button className={`tab ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>🎒 Items</button>
          </div>
          <div className="sidebar-content">
            {activeTab === 'map' && (
              <MapView
                location={location}
                exits={exits}
                onMove={move}
                onSearch={handleSearch}
                onPickup={handlePickupItem}
                characters={characters}
                loading={loading}
              />
            )}
            {activeTab === 'party' && (
              <div className="party-sheet">
                {Object.values(characters).map(c => (
                  <CharacterSheet key={c.id} character={c} onUseItem={handleUseItem} />
                ))}
              </div>
            )}
            {activeTab === 'quests' && <QuestJournal quests={quests} />}
            {activeTab === 'inventory' && (
              <div className="inventory-tab">
                {Object.values(characters).filter(c => c.role !== 'Rival').map(c => (
                  <CharacterSheet key={c.id} character={c} onUseItem={handleUseItem} />
                ))}
              </div>
            )}
          </div>
        </aside>

        <main className="main-area">
          {combat?.in_combat && (
            <CombatPanel
              combat={combat}
              characters={characters}
              onAction={handleAction}
              onFlee={handleFlee}
              loading={loading}
            />
          )}
          <ActionPanel
            log={log}
            loading={loading}
            inCombat={combat?.in_combat || false}
            exits={exits}
            characters={characters}
            location={location}
            onMove={move}
            onSearch={handleSearch}
            onTalk={handleTalk}
            onAction={handleAction}
            onRest={rest}
            onSave={() => saveGame()}
            onClearLog={clearLog}
          />
        </main>
      </div>

      <div className="input-bar">
        <input
          type="text"
          value={playerInput}
          onChange={e => setPlayerInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleCustomAction(); }}
          placeholder="Type an action (e.g., 'go north', 'search', 'talk to Elder Maren', 'attack hollow')..."
          disabled={loading}
        />
        <button onClick={handleCustomAction} disabled={loading || !playerInput.trim()}>
          {loading ? '⏳' : '▶ Act'}
        </button>
        {Object.values(characters).filter(c => c.health < c.max_health).length > 0 && (
          <button className="btn-quick-rest" onClick={() => rest(false)} disabled={loading || combat?.in_combat}>
            🩹 Rest
          </button>
        )}
      </div>

      {error && (
        <div className="error-toast" onClick={() => setError(null)}>
          ❌ {error}
        </div>
      )}

      <DiceRoll result={diceResult} onClose={() => setDiceResult(null)} />
    </div>
  );
}

export default App;
