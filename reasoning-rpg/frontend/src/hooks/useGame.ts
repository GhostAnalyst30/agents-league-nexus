import { useState, useEffect, useCallback, useRef } from 'react';
import {
  api,
  GameSummary,
  LocationInfo,
  ExitInfo,
  QuestData,
  CombatInfo,
  CharacterDetail,
} from '../services/api';

export interface LogEntry {
  id: number;
  type: 'narrative' | 'combat' | 'system' | 'loot' | 'move' | 'quest' | 'roll' | 'dialog';
  text: string;
  timestamp: number;
}

export function useGame() {
  const [summary, setSummary] = useState<GameSummary | null>(null);
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [exits, setExits] = useState<ExitInfo[]>([]);
  const [quests, setQuests] = useState<QuestData[]>([]);
  const [combat, setCombat] = useState<CombatInfo | null>(null);
  const [characters, setCharacters] = useState<Record<string, CharacterDetail>>({});
  const [log, setLog] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logIdRef = useRef(0);

  const addLog = useCallback((type: LogEntry['type'], text: string) => {
    logIdRef.current += 1;
    setLog(prev => [...prev, { id: logIdRef.current, type, text, timestamp: Date.now() }]);
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      const [s, l, e, q, combatState] = await Promise.all([
        api.getSummary(),
        api.getLocation(),
        api.getExits(),
        api.getQuests(),
        api.getCombatState(),
      ]);
      setSummary(s);
      setLocation(l);
      setExits(e);
      setQuests(q);
      setCombat(combatState);

      const charMap: Record<string, CharacterDetail> = {};
      for (const [id] of Object.entries(s.party)) {
        try {
          charMap[id] = await api.getCharacter(id);
        } catch { /* ignore */ }
      }
      setCharacters(charMap);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh game state');
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const move = useCallback(async (direction: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.move(direction);
      addLog('move', `Moved ${direction} to ${result.to}`);
      if (result.encounter) {
        addLog('combat', `ENCOUNTER: ${result.encounter.description}`);
      }
      await refreshAll();
      return result;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, [addLog, refreshAll]);

  const search = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.search();
      addLog('roll', `${result.roll.actor} rolled ${result.roll.check}: ${result.result}`);
      if (result.found?.length > 0) {
        addLog('loot', `Found: ${result.found.join(', ')}`);
      } else {
        addLog('narrative', 'Nothing of interest found.');
      }
      await refreshAll();
      return result;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, [addLog, refreshAll]);

  const talk = useCallback(async (npcName: string) => {
    setLoading(true);
    try {
      const result = await api.talk(npcName);
      addLog('dialog', `${npcName}: "${result.dialogue}"`);
      if (result.quest_updates?.length > 0) {
        for (const u of result.quest_updates) {
          addLog('quest', `${u.quest_name}: ${u.objective} completed! (${u.progress})`);
        }
      }
      await refreshAll();
      return result;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, [addLog, refreshAll]);

  const startCombat = useCallback(async (enemyIds: string[]) => {
    setLoading(true);
    try {
      const result = await api.startCombat(enemyIds);
      addLog('combat', `COMBAT STARTED!`);
      await refreshAll();
      return result;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, [addLog, refreshAll]);

  const combatAction = useCallback(async (action: string, targetId?: string) => {
    setLoading(true);
    try {
      const result = await api.combatAction(action, targetId);
      if (result.results) {
        for (const msg of result.results) {
          addLog('combat', msg);
        }
      }
      if (result.victory) {
        addLog('system', '★ VICTORY! The party triumphs!');
      }
      if (result.defeat) {
        addLog('system', '✖ DEFEAT! The party has fallen...');
      }
      await refreshAll();
      return result;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, [addLog, refreshAll]);

  const flee = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.fleeCombat();
      if (result.fled) {
        addLog('system', 'The party fled from combat!');
        await refreshAll();
      }
      return result;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, [addLog, refreshAll]);

  const useItem = useCallback(async (characterId: string, itemName: string, targetId?: string) => {
    setLoading(true);
    try {
      const result = await api.useItem(characterId, itemName, targetId);
      if (result.healed) {
        addLog('system', `${result.used_by} used ${result.item}, healing ${result.healed} HP`);
      }
      await refreshAll();
      return result;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, [addLog, refreshAll]);

  const pickupItem = useCallback(async (characterId: string, item: string) => {
    setLoading(true);
    try {
      const result = await api.pickupItem(characterId, item);
      addLog('loot', `${result.character} picked up ${result.item}`);
      await refreshAll();
      return result;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, [addLog, refreshAll]);

  const rest = useCallback(async (isLong: boolean) => {
    setLoading(true);
    try {
      const result = await api.rest(isLong);
      const type = isLong ? 'long' : 'short';
      addLog('system', `Party took a ${type} rest.`);
      for (const [, r] of Object.entries(result.results || {})) {
        const recovery = r as { name: string; recovered: number; new_hp: number; max_health: number };
        if (recovery.recovered > 0) {
          addLog('system', `${recovery.name} recovered ${recovery.recovered} HP (${recovery.new_hp}/${recovery.max_health})`);
        }
      }
      await refreshAll();
      return result;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, [addLog, refreshAll]);

  const saveGame = useCallback(async (slot?: string) => {
    try {
      return await api.save(slot);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const loadGame = useCallback(async (slot?: string) => {
    try {
      const result = await api.load(slot);
      addLog('system', 'Game loaded!');
      await refreshAll();
      return result;
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message);
    }
  }, [addLog, refreshAll]);

  const clearLog = useCallback(() => {
    setLog([]);
  }, []);

  return {
    summary,
    location,
    exits,
    quests,
    combat,
    characters,
    log,
    loading,
    error,
    setError,
    setLog,
    move,
    search,
    talk,
    startCombat,
    combatAction,
    flee,
    useItem,
    pickupItem,
    rest,
    saveGame,
    loadGame,
    clearLog,
    refreshAll,
    addLog,
  };
}
