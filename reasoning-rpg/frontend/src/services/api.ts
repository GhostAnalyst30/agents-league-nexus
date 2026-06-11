import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export interface PartyMember {
  name: string;
  role: string;
  health: number;
  max_health: number;
  stamina: number;
  max_stamina: number;
  level: number;
  experience: number;
}

export interface LocationInfo {
  id: string;
  name: string;
  description: string;
  type: string;
  region: string;
  npcs: string[];
  items: string[];
  secrets: string[];
  exits: ExitInfo[];
}

export interface ExitInfo {
  direction: string;
  id: string;
  name: string;
  description: string;
}

export interface QuestData {
  id: string;
  name: string;
  description: string;
  status: string;
  objectives: string[];
  original_objectives: string[];
  clues: string[];
  progress?: string;
}

export interface GameSummary {
  campaign: string;
  location: { id: string; name: string; description: string };
  party: Record<string, PartyMember>;
  turn: number;
  phase: string;
  in_combat: boolean;
}

export interface CombatInfo {
  in_combat: boolean;
  current_turn?: string;
  turn_number?: number;
  enemies?: Record<string, { name: string; health: number; max_health: number }>;
  party?: Record<string, { name: string; health: number; max_health: number }>;
  log?: string[];
}

export interface CharacterDetail {
  id: string;
  name: string;
  role: string;
  health: number;
  max_health: number;
  stamina: number;
  max_stamina: number;
  experience: number;
  level: number;
  gold: number;
  inventory: string[];
  abilities: Record<string, number>;
  conditions: string[];
}

export const api = {
  getSummary: () => API.get<GameSummary>('/summary').then(r => r.data),
  getLocation: () => API.get<LocationInfo>('/location').then(r => r.data),
  getExits: () => API.get<{ exits: ExitInfo[] }>('/exits').then(r => r.data.exits),
  getQuests: () => API.get<Record<string, QuestData>>('/quests').then(r => Object.values(r.data)),
  getCharacter: (id: string) => API.get<CharacterDetail>(`/character/${id}`).then(r => r.data),
  getCombatState: () => API.get<CombatInfo>('/combat/state').then(r => r.data),
  getEncounters: () => API.get<{ encounters: { enemy_ids: string[]; description: string }[] }>('/encounters').then(r => r.data.encounters),

  move: (direction: string) => API.post('/move', { direction }).then(r => r.data),
  search: () => API.post('/search').then(r => r.data),
  talk: (npcName: string) => API.post('/talk', { npc_name: npcName }).then(r => r.data),
  rest: (isLong: boolean) => API.post('/rest', { is_long_rest: isLong }).then(r => r.data),

  startCombat: (enemyIds: string[]) => API.post(`/combat/start?enemy_ids=${enemyIds.join('&enemy_ids=')}`).then(r => r.data),
  combatAction: (action: string, targetId?: string) => API.post('/combat/action', { action, target_id: targetId }).then(r => r.data),
  fleeCombat: () => API.post('/combat/flee').then(r => r.data),

  useItem: (characterId: string, itemName: string, targetId?: string) =>
    API.post('/inventory/use', { character_id: characterId, item_name: itemName, target_id: targetId }).then(r => r.data),
  pickupItem: (characterId: string, item: string) =>
    API.post('/inventory/pickup', { character_id: characterId, item }).then(r => r.data),
  dropItem: (characterId: string, item: string) =>
    API.post('/inventory/drop', { character_id: characterId, item }).then(r => r.data),

  roll: (characterId: string, checkType: string, difficulty: number) =>
    API.post('/roll', { character_id: characterId, check_type: checkType, difficulty }).then(r => r.data),

  save: (slot: string = 'autosave') => API.post('/save', { slot }).then(r => r.data),
  load: (slot: string = 'autosave') => API.post('/load', { slot }).then(r => r.data),
  listSaves: () => API.get<{ saves: { slot: string }[] }>('/saves').then(r => r.data.saves),
};
