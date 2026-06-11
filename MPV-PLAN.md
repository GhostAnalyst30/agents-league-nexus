# MVP PLAN: Challenge B - Role-Play Game System

## Análisis del Proyecto Actual

### ❌ No alineado
| Aspecto | Proyecto Actual | Lo Que Pide el Challenge |
|---------|----------------|--------------------------|
| Stack | Next.js/TypeScript | Python 3.10+ |
| Arquitectura | Web App genérica | Multi-agente con Microsoft Foundry |
| Agentes | Goal Analysis, Skill Gap, Learning Path, etc. | Game Master, Warrior, Mage, Rogue, Healer, Rival |
| IQ Layers | Ninguno | Work IQ, Foundry IQ, Fabric IQ (mínimo 1) |
| Propósito | Human Evolution OS | Fantasy RPG o Enterprise Learning |
| Datos sintéticos | No tiene | Requerido |
| Despliegue | Vercel | Foundry Agent Service |

### ✅ Aprovechable
- Experiencia en TypeScript (para frontend React)
- Concepto de agentes con roles
- Estructura de proyecto modular
- Experiencia con APIs de LLM (OpenRouter)

---

## Estrategia de Migración

**Stack final:**
- **Backend**: Python 3.10+ con FastAPI
- **Frontend**: React (TypeScript, manteniendo skills existentes)
- **LLM**: OpenRouter para testing → Microsoft Foundry para producción
- **Base de datos**: SQLite (dev) → PostgreSQL (prod)
- **Contenedor**: Docker

**Enfoque**: Construir en `reasoning-rpg/` dentro del mismo repositorio, conservando nexus-ai intacto.

---

## Fase 1: Fundación (Día 1-2)

### 1.1 Estructura de Directorios

```
reasoning-rpg/
├── README.md
├── .env.example
├── .gitignore
├── requirements.txt
├── setup.py
├── Dockerfile
├── docker-compose.yml
├── src/
│   ├── __init__.py
│   ├── main.py                          # FastAPI entry point
│   ├── config.py                        # Environment configuration
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── base.py                      # BaseAgent abstract class
│   │   ├── game_master.py               # Orchestrator + Narrator
│   │   ├── warrior.py                   # Frontline fighter
│   │   ├── mage.py                      # Arcane scholar
│   │   ├── rogue.py                     # Scout and trickster
│   │   ├── healer.py                    # Support and lore keeper
│   │   └── rival.py                     # Recurring story character
│   ├── iq_layers/
│   │   ├── __init__.py
│   │   ├── foundry_iq.py                # Knowledge grounding
│   │   └── work_iq.py                   # Context awareness
│   ├── game/
│   │   ├── __init__.py
│   │   ├── rules.py                     # Dice, combat, checks
│   │   ├── state.py                     # World + campaign state
│   │   ├── quests.py                    # Quest management
│   │   └── inventory.py                 # Items and artifacts
│   ├── synthetic_data/
│   │   ├── __init__.py
│   │   ├── world.py                     # World generation
│   │   ├── characters.py                # Character profiles
│   │   ├── locations.py                 # Location data
│   │   ├── factions.py                  # Faction data
│   │   ├── quests.py                    # Quest data
│   │   ├── items.py                     # Item data
│   │   └── bestiary.py                  # Monster data
│   └── utils/
│       ├── __init__.py
│       ├── llm.py                       # LLM provider abstraction
│       ├── logging.py                   # Agent telemetry
│       └── validation.py                # Input/output validation
├── tests/
│   ├── __init__.py
│   ├── test_agents.py
│   ├── test_rules.py
│   ├── test_state.py
│   └── test_integration.py
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.tsx
        ├── components/
        │   ├── GameScreen.tsx
        │   ├── CharacterSheet.tsx
        │   ├── CombatLog.tsx
        │   ├── DiceRoll.tsx
        │   └── QuestJournal.tsx
        ├── services/
        │   └── api.ts
        └── hooks/
            └── useGame.ts
```

### 1.2 Configuración Python

**requirements.txt**
```txt
fastapi==0.115.0
uvicorn[standard]==0.30.0
pydantic==2.9.0
pydantic-settings==2.5.0
httpx==0.27.0
python-dotenv==1.0.1
openai==1.51.0
pytest==8.3.0
pytest-asyncio==0.24.0
pytest-cov==5.0.0
```

**.env.example**
```bash
# === LLM PROVIDER ===
# Para testing con OpenRouter:
OPENROUTER_API_KEY=sk-or-v1-
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Para produccion con Microsoft Foundry:
# AZURE_AI_PROJECT_ENDPOINT=
# AZURE_AI_MODEL_DEPLOYMENT=gpt-4o
# AZURE_OPENAI_API_KEY=
# AZURE_OPENAI_ENDPOINT=

# === APP ===
APP_NAME=ReasoningRPG
DEBUG=true
LOG_LEVEL=INFO

# === DATABASE ===
DATABASE_URL=sqlite:///./rpg.db
```

### 1.3 LLM Provider Abstraction

**src/utils/llm.py**
```python
import os
from abc import ABC, abstractmethod
from typing import Optional

class LLMProvider(ABC):
    @abstractmethod
    async def chat(
        self,
        system_prompt: str,
        user_message: str,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> str:
        pass

class OpenRouterProvider(LLMProvider):
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = os.getenv(
            "OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"
        )
        self.model = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")

    async def chat(
        self,
        system_prompt: str,
        user_message: str,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> str:
        import httpx

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message},
                    ],
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                },
                timeout=30,
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

class FoundryProvider(LLMProvider):
    def __init__(self):
        self.api_key = os.getenv("AZURE_OPENAI_API_KEY")
        self.endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        self.deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4o")

    async def chat(
        self,
        system_prompt: str,
        user_message: str,
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> str:
        import httpx

        url = (
            f"{self.endpoint}/openai/deployments/{self.deployment}"
            f"/chat/completions?api-version=2024-02-15-preview"
        )
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers={
                    "Content-Type": "application/json",
                    "api-key": self.api_key,
                },
                json={
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_message},
                    ],
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                },
                timeout=30,
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

def get_llm_provider() -> LLMProvider:
    if os.getenv("OPENROUTER_API_KEY"):
        return OpenRouterProvider()
    elif os.getenv("AZURE_OPENAI_API_KEY"):
        return FoundryProvider()
    raise ValueError(
        "No LLM provider configured. "
        "Set OPENROUTER_API_KEY or AZURE_OPENAI_API_KEY"
    )
```

---

## Fase 2: Core del Juego (Día 3-5)

### 2.1 Game State

**src/game/state.py**
```python
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Any
from enum import Enum
import json

class CheckResult(Enum):
    CRITICAL_SUCCESS = "critical_success"
    SUCCESS = "success"
    PARTIAL_SUCCESS = "partial_success"
    FAILURE = "failure"
    CRITICAL_FAILURE = "critical_failure"

@dataclass
class Character:
    agent_id: str
    name: str
    role: str
    health: int
    max_health: int
    stamina: int
    max_stamina: int
    inventory: List[str] = field(default_factory=list)
    abilities: Dict[str, int] = field(default_factory=dict)
    backstory: str = ""
    personality: str = ""

@dataclass
class Location:
    id: str
    name: str
    description: str
    exits: Dict[str, str] = field(default_factory=dict)
    npcs: List[str] = field(default_factory=list)
    items: List[str] = field(default_factory=list)
    secrets: List[str] = field(default_factory=list)

@dataclass
class Quest:
    id: str
    name: str
    description: str
    status: str = "active"  # active, completed, failed
    objectives: List[str] = field(default_factory=list)
    clues: List[str] = field(default_factory=list)
    rewards: List[str] = field(default_factory=list)

@dataclass
class GameState:
    campaign_id: str
    campaign_name: str
    current_location: str
    party: Dict[str, Character] = field(default_factory=dict)
    locations: Dict[str, Location] = field(default_factory=dict)
    quests: Dict[str, Quest] = field(default_factory=dict)
    world_flags: Dict[str, Any] = field(default_factory=dict)
    faction_reputation: Dict[str, int] = field(default_factory=dict)
    turn_count: int = 0
    session_log: List[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return asdict(self)

    def add_to_log(self, entry: str):
        self.session_log.append(f"[Turn {self.turn_count}] {entry}")

    def get_party_summary(self) -> str:
        lines = []
        for char in self.party.values():
            status = (
                f"{char.name} ({char.role}) "
                f"HP: {char.health}/{char.max_health} "
                f"ST: {char.stamina}/{char.max_stamina}"
            )
            lines.append(status)
        return "\n".join(lines)
```

### 2.2 Game Rules (Dice + Combat)

**src/game/rules.py**
```python
import random
import json
from typing import Dict, Any, Optional
from .state import CheckResult, Character

class DiceRoller:
    @staticmethod
    def roll(dice: str) -> int:
        """Roll dice in format 'NdM' (e.g., '1d20', '2d6')"""
        import re
        match = re.match(r"(\d+)d(\d+)", dice)
        if not match:
            raise ValueError(f"Invalid dice format: {dice}")
        count, sides = int(match.group(1)), int(match.group(2))
        return sum(random.randint(1, sides) for _ in range(count))

    @staticmethod
    def ability_check(
        character: Character, ability: str, difficulty: int
    ) -> Dict[str, Any]:
        """Roll an ability check against a difficulty class."""
        modifier = character.abilities.get(ability, 0)
        roll = DiceRoller.roll("1d20")
        total = roll + modifier

        if roll == 20:
            result = CheckResult.CRITICAL_SUCCESS
        elif roll == 1:
            result = CheckResult.CRITICAL_FAILURE
        elif total >= difficulty + 5:
            result = CheckResult.SUCCESS
        elif total >= difficulty:
            result = CheckResult.PARTIAL_SUCCESS
        else:
            result = CheckResult.FAILURE

        return {
            "actor": character.name,
            "check": ability,
            "roll": roll,
            "modifier": modifier,
            "total": total,
            "difficulty": difficulty,
            "result": result.value,
        }

    @staticmethod
    def attack_roll(
        attacker: Character, defender: Character
    ) -> Dict[str, Any]:
        """Simple attack roll vs armor."""
        attack_roll = DiceRoller.roll("1d20")
        attack_mod = attacker.abilities.get("strength", 0)
        attack_total = attack_roll + attack_mod

        defense_mod = defender.abilities.get("dexterity", 0)
        defense_dc = 10 + defense_mod

        hit = attack_total >= defense_dc

        if hit:
            damage = DiceRoller.roll("1d8") + attacker.abilities.get("strength", 0)
        else:
            damage = 0

        return {
            "attacker": attacker.name,
            "defender": defender.name,
            "attack_roll": attack_roll,
            "attack_total": attack_total,
            "defense_dc": defense_dc,
            "hit": hit,
            "damage": damage,
        }
```

### 2.3 Quest Management

**src/game/quests.py**
```python
from typing import Dict, List, Optional
from .state import Quest

class QuestManager:
    def __init__(self):
        self.quests: Dict[str, Quest] = {}

    def add_quest(self, quest: Quest):
        self.quests[quest.id] = quest

    def get_active_quests(self) -> List[Quest]:
        return [q for q in self.quests.values() if q.status == "active"]

    def get_completed_quests(self) -> List[Quest]:
        return [q for q in self.quests.values() if q.status == "completed"]

    def complete_objective(self, quest_id: str, objective: str) -> bool:
        quest = self.quests.get(quest_id)
        if not quest or quest.status != "active":
            return False
        if objective in quest.objectives:
            quest.objectives.remove(objective)
            quest.clues.append(f"Objective completed: {objective}")
            if not quest.objectives:
                quest.status = "completed"
            return True
        return False

    def fail_quest(self, quest_id: str) -> bool:
        quest = self.quests.get(quest_id)
        if not quest:
            return False
        quest.status = "failed"
        return True

    def get_quest_summary(self) -> str:
        lines = []
        for quest in self.quests.values():
            lines.append(
                f"- {quest.name}: {quest.status} "
                f"({len(quest.objectives)} objectives remaining)"
            )
        return "\n".join(lines) if lines else "No quests."
```

---

## Fase 3: Foundry IQ Layer (Día 6-7)

### 3.1 FoundryIQ Implementation

**src/iq_layers/foundry_iq.py**
```python
import json
import os
from typing import Dict, Any, List, Optional
from ..utils.llm import LLMProvider

class FoundryIQ:
    """
    Foundry IQ layer for grounded knowledge retrieval.
    En producción se conecta a Azure AI Search + Blob Storage.
    En desarrollo usa archivos markdown locales como conocimiento sintético.
    """

    def __init__(self, llm_provider: LLMProvider):
        self.llm = llm_provider
        self.knowledge_base: Dict[str, str] = {}
        self._load_knowledge_base()

    def _load_knowledge_base(self):
        """Load synthetic data files as knowledge base."""
        kb_dir = os.path.join(
            os.path.dirname(__file__), "..", "synthetic_data"
        )
        if not os.path.exists(kb_dir):
            return

        for filename in os.listdir(kb_dir):
            if filename.endswith((".md", ".txt", ".json")):
                filepath = os.path.join(kb_dir, filename)
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                key = filename.replace(".md", "").replace(".txt", "")
                self.knowledge_base[key] = content

    def query(self, topic: str) -> Optional[str]:
        """Simple keyword-based retrieval (MVP).
        En producción: Azure AI Search vector + hybrid search."""
        topic_lower = topic.lower()
        for key, content in self.knowledge_base.items():
            if topic_lower in key.lower() or topic_lower in content.lower():
                return content
        return None

    async def retrieve_lore(
        self, query: str, context: Dict[str, Any]
    ) -> str:
        """Retrieve grounded lore with citations."""
        # 1. Search knowledge base
        kb_result = self.query(query)

        # 2. If found, return cited content
        if kb_result:
            return kb_result

        # 3. If not found, use LLM with available context
        system_prompt = (
            "Eres un motor de conocimiento de mundo para un juego RPG. "
            "Debes responder SOLO con informacion que exista en el contexto "
            "proporcionado. Si no sabes algo, di 'No tengo informacion sobre eso'."
        )
        context_str = json.dumps(context, indent=2)
        user_prompt = (
            f"Consulta: {query}\n\n"
            f"Conocimiento disponible:\n{context_str}"
        )

        response = await self.llm.chat(
            system_prompt=system_prompt,
            user_message=user_prompt,
            temperature=0.3,  # Low temperature for factual retrieval
        )
        return response
```

### 3.2 Synthetic Data Generation

**src/synthetic_data/world.py**
```python
"""Synthetic world data for the RPG campaign.
ALL content is original and fictional. No copyrighted material."""

WORLD_OVERVIEW = """# The Shattered Moon of Eldervale

## World Overview
Eldervale is a fantasy realm where the moon shattered centuries ago,
scattering magical fragments across the land. The fragments, called
"Starfall Shards," are the source of all magic. Kingdoms rose and fell
as factions fought for control of these shards.

## Geography
- Northern Eldervale: Frozen tundra, ancient ruins, dragon territories
- The Verdant Reach: Lush forests, elven enclaves, hidden groves
- The Sunken Coast: Trading ports, pirate dens, sunken temples
- The Ashen Wastes: Desert, volcanic region, forgotten civilizations
- The Skyborn Peaks: Mountain ranges, monastic orders, cloud cities

## Laws of Magic
- Magic flows from Starfall Shards
- Only those attuned to a shard can cast spells
- Shards can be corrupted by dark emotions
- Magic is strongest under moonlight
- Using too much magic attracts "The Hollow" (void creatures)

## Calendar
- Year: 842 AS (After Shattering)
- Season: Deepautumn
- Festival: MoonReap (harvest festival, 3 days)
"""

LOCATIONS = [
    {
        "id": "moonlit_gate",
        "name": "The Moonlit Gate",
        "type": "Ancient ruin",
        "region": "Northern Eldervale",
        "description": "A silver stone archway buried in a ruined chapel. "
                       "It opens only under moonlight when three conflicting "
                       "truths are spoken by three different travelers.",
        "exits": {"north": "frostwood_forest", "south": "silverbrook_village"},
        "items": ["rusted_key", "old_journal_page"],
        "secrets": [
            "The gate opens to a memory of the kingdom before the moon shattered",
            "Opening without the Starwell Relic summons a guardian"
        ],
    },
    {
        "id": "silverbrook_village",
        "name": "Silverbrook Village",
        "type": "Settlement",
        "region": "Northern Eldervale",
        "description": "A small logging village at the edge of the Frostwood. "
                       "Friendly locals, a tavern called The Splintered Antler, "
                       "and a temple of the Silver Root.",
        "exits": {"north": "moonlit_gate", "east": "frostwood_forest"},
        "npcs": ["Elder Maren", "Brom the Blacksmith", "Sister Lys"],
        "items": ["healing_potion", "trail_rations"],
    },
    {
        "id": "frostwood_forest",
        "name": "Frostwood Forest",
        "type": "Forest",
        "region": "Northern Eldervale",
        "description": "A dense pine forest where the trees grow in twisted "
                       "patterns. Strange lights dance between the trunks. "
                       "Rumors speak of a hidden glade with a Starfall Shard.",
        "exits": {"south": "silverbrook_village", "west": "moonlit_gate"},
        "npcs": ["Wandering Merchant"],
        "items": ["silver_herb", "ancient_coin"],
        "secrets": ["A hidden grove contains a minor Starfall Shard"],
    },
]

FACTIONS = [
    {
        "id": "order_silver_root",
        "name": "Order of the Silver Root",
        "type": "Religious order",
        "goals": ["Preserve ancient knowledge", "Heal the land"],
        "leader": "High Mother Corina",
        "headquarters": "Silverbrook Temple",
        "allies": ["Silverbrook Village"],
        "enemies": ["The Hollow Cult"],
        "secrets": [
            "They know the true purpose of the Moonlit Gate",
            "They possess a map to three Starfall Shards",
        ],
    },
    {
        "id": "hollow_cult",
        "name": "The Hollow Cult",
        "type": "Secret cult",
        "goals": ["Collect all Starfall Shards", "Open the Void"],
        "leader": "Unknown (called 'The Whisper')",
        "headquarters": "Hidden temple in the Ashen Wastes",
        "enemies": ["Order of the Silver Root", "All kingdoms"],
        "secrets": [
            "Led by a formerly respected mage who went mad",
            "Can track Starfall Shard locations",
        ],
    },
]

CHARACTERS = [
    {
        "id": "warrior",
        "name": "Bran Ironvale",
        "role": "Warrior",
        "health": 25,
        "abilities": {"strength": 5, "dexterity": 2, "constitution": 4},
        "backstory": (
            "Ex-soldier of the Northern Guard. Lost his family shield "
            "during a Hollow Cult raid. Sworn to recover it."
        ),
        "personality": "Brave, direct, protective, suspicious of magic",
        "inventory": ["longsword", "shield", "torch", "trail_rations"],
    },
    {
        "id": "mage",
        "name": "Lyra Vey",
        "role": "Mage",
        "health": 14,
        "abilities": {"intelligence": 5, "wisdom": 3, "charisma": 2},
        "backstory": (
            "Apprentice of the Arcane Academy. Believes the myth of the "
            "Starwell is real and seeks to prove it."
        ),
        "personality": "Curious, analytical, slightly arrogant",
        "inventory": ["spellbook", "crystal_focus", "scroll_of_light"],
    },
    {
        "id": "rogue",
        "name": "Kira Swiftfoot",
        "role": "Rogue",
        "health": 16,
        "abilities": {"dexterity": 5, "charisma": 3, "intelligence": 2},
        "backstory": (
            "Former thieves' guild operative. Has contacts in every major "
            "city. Seeking a way to clear her debt to the guild."
        ),
        "personality": "Witty, skeptical, opportunistic",
        "inventory": ["lockpicks", "smoke_bomb", "short_sword"],
    },
    {
        "id": "healer",
        "name": "Sister Elara",
        "role": "Healer",
        "health": 18,
        "abilities": {"wisdom": 5, "charisma": 3, "constitution": 2},
        "backstory": (
            "Novice of the Silver Root order. Believes the cursed Frostwood "
            "can be healed rather than destroyed."
        ),
        "personality": "Compassionate, observant, principled",
        "inventory": ["healing_staff", "herbs", "holy_symbol"],
    },
    {
        "id": "rival",
        "name": "Kael Thorn",
        "role": "Rival",
        "health": 20,
        "abilities": {"charisma": 4, "intelligence": 3, "dexterity": 3},
        "backstory": (
            "Wealthy relic hunter. Knows more about the ancient ruins "
            "than he admits. Seeks the Starwell Relic for his own purposes."
        ),
        "personality": "Charismatic, proud, unpredictable",
        "inventory": ["fine_sword", "compass", "old_map"],
    },
]

QUESTS = [
    {
        "id": "starwell_relic",
        "name": "Find the Starwell Relic",
        "description": "A legendary artifact hidden in the Moonlit Gate. "
                       "Required to restore the shattered moon.",
        "objectives": [
            "Enter the Moonlit Gate",
            "Find the three conflicting truths",
            "Claim the Starwell Relic",
            "Defeat the guardian",
        ],
        "clues": [
            "The gate symbol matches an eye-shaped sigil",
            "The Healer's order knows about the gate",
            "The Rival claims the gate leads to a vault",
        ],
    },
]

ITEMS = [
    {
        "id": "starwell_relic",
        "name": "Starwell Relic",
        "type": "Artifact",
        "description": "A pulsing crystal shard that hums with ancient power. "
                       "Key to restoring the shattered moon.",
    },
    {
        "id": "healing_potion",
        "name": "Healing Potion",
        "type": "Consumable",
        "effect": "Restores 2d4+2 health",
    },
]

BESTIARY = [
    {
        "id": "hollow_guardian",
        "name": "Hollow Guardian",
        "type": "Construct",
        "health": 30,
        "abilities": {"strength": 4, "dexterity": 1, "constitution": 5},
        "weaknesses": ["Radiant damage", "Silver weapons"],
        "behavior": "Defends the Moonlit Gate. Attacks intruders on sight.",
        "loot": ["starwell_shard", "ancient_coin"],
    },
]

HOMEBREW_RULES = """# Homebrew Rules (Lightweight RPG)

## Ability Checks
- Roll 1d20 + ability modifier
- Target number set by Game Master (10=easy, 15=medium, 20=hard)
- Critical success on natural 20, critical failure on natural 1

## Combat
- Initiative: 1d20 + dexterity modifier
- Attack: 1d20 + strength/dexterity modifier vs DC 10 + target dexterity
- Damage: weapon die + strength modifier
- Health: 0 HP = unconscious, -max HP = dead

## Rest
- Short rest (1 hour): recover 1d8 + constitution HP
- Long rest (8 hours): full recovery, restore stamina

## Inventory
- Characters can carry 10 items (plus equipped gear)
- Consumables stack up to 5

## Leveling
- After 3 quests completed: +2 to one ability, +1d8 max health
"""
```

---

## Fase 4: Agentes (Día 8-12)

### 4.1 Base Agent

**src/agents/base.py**
```python
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, Any, Optional
from ..utils.llm import LLMProvider
from ..game.state import GameState

@dataclass
class AgentResponse:
    narrative: str
    action: Optional[str] = None
    roll_request: Optional[Dict[str, Any]] = None
    state_changes: Optional[Dict[str, Any]] = None

class BaseAgent(ABC):
    """Base class for all character agents."""

    def __init__(
        self, agent_id: str, name: str, role: str, llm: LLMProvider
    ):
        self.agent_id = agent_id
        self.name = name
        self.role = role
        self.llm = llm

    @abstractmethod
    async def respond(
        self, player_input: str, state: GameState, context: Dict[str, Any]
    ) -> AgentResponse:
        pass

    def _build_system_prompt(
        self, state: GameState, extra_context: str = ""
    ) -> str:
        party_state = state.get_party_summary()
        return (
            f"Eres {self.name}, un(a) {self.role} en una aventura RPG. "
            f"{self._get_personality()}\n\n"
            f"Estado actual:\n{party_state}\n\n"
            f"Ubicacion: {state.current_location}\n"
            f"{extra_context}\n\n"
            f"Responde EN PERSONAJE. Usa espanol. "
            f"Maximo 3 parrafos. Proporciona informacion util "
            f"y relevante a la situacion."
        )

    def _get_personality(self) -> str:
        raise NotImplementedError
```

### 4.2 Game Master Agent

**src/agents/game_master.py**
```python
from typing import Dict, Any, Optional
from .base import BaseAgent, AgentResponse
from ..utils.llm import LLMProvider
from ..game.state import GameState, Character
from ..game.rules import DiceRoller
from ..iq_layers.foundry_iq import FoundryIQ

class GameMasterAgent(BaseAgent):
    """
    The Game Master coordinates the full adventure loop.
    Combines: master, narrator, and world builder.
    """

    def __init__(self, llm: LLMProvider, foundry_iq: FoundryIQ):
        super().__init__("gm", "Game Master", "Orchestrator", llm)
        self.foundry_iq = foundry_iq
        self.dice = DiceRoller()

    async def respond(
        self, player_input: str, state: GameState, context: Dict[str, Any]
    ) -> AgentResponse:
        # 1. Retrieve relevant lore
        lore = await self.foundry_iq.retrieve_lore(
            player_input,
            {
                "current_location": state.current_location,
                "party": [char.name for char in state.party.values()],
                "active_quests": [
                    q.name for q in state.quests.values()
                    if q.status == "active"
                ],
            },
        )

        # 2. Determine which character agents should respond
        agents_to_call = self._select_agents(player_input)

        # 3. Build scene prompt
        system_prompt = (
            "Eres el Game Master (Director de Juego) de una aventura RPG "
            "de fantasia medieval.\n\n"
            "TUS RESPONSABILIDADES:\n"
            "- Narrar la escena y describir consecuencias\n"
            "- Aplicar reglas del juego (tiradas, combate, etc.)\n"
            "- Mantener coherencia del mundo\n"
            "- Decidir cuando se necesita una tirada de dados\n"
            "- Ofrecer opciones claras al jugador\n\n"
            "CONOCIMIENTO DEL MUNDO:\n"
            f"{lore}\n\n"
            "REGLAS:\n"
            "- Tirada facil: DC 10, Media: DC 15, Dificil: DC 20\n"
            "- Usa 1d20 + modificador para las tiradas\n"
            "- Critico en 20 natural, pifia en 1 natural\n\n"
            "Responde EN PERSONAJE. En espanol. "
            "Maximo 4 parrafos. Termina con 2-3 opciones para el jugador."
        )

        user_prompt = (
            f"El jugador dice: '{player_input}'\n\n"
            f"Ubicacion actual: {state.current_location}\n"
            f"Estado del grupo:\n{state.get_party_summary()}\n"
            f"Misiones activas:\n{context.get('quest_summary', 'Ninguna')}\n"
            f"Agentes involucrados: {', '.join(agents_to_call)}\n\n"
            f"Describe la escena y el resultado de la accion del jugador."
        )

        narrative = await self.llm.chat(
            system_prompt=system_prompt,
            user_message=user_prompt,
            temperature=0.8,
            max_tokens=512,
        )

        return AgentResponse(
            narrative=narrative,
            action="continue",
            state_changes={"turn_count": state.turn_count + 1},
        )

    def _select_agents(self, player_input: str) -> list:
        """Determine which agents should participate."""
        input_lower = player_input.lower()
        agents = []

        if any(w in input_lower for w in
               ["fight", "attack", "defend", "protect", "charge"]):
            agents.append("warrior")
        if any(w in input_lower for w in
               ["magic", "spell", "arcane", "rune", "artifact"]):
            agents.append("mage")
        if any(w in input_lower for w in
               ["sneak", "lock", "trap", "stealth", "hide", "search"]):
            agents.append("rogue")
        if any(w in input_lower for w in
               ["heal", "rest", "wound", "hurt", "potion", "pray"]):
            agents.append("healer")
        if any(w in input_lower for w in
               ["rival", "kael", "thorn", "compete"]):
            agents.append("rival")

        return agents if agents else ["warrior", "mage", "rogue", "healer"]
```

### 4.3 Character Agents

**src/agents/warrior.py**
```python
from typing import Dict, Any
from .base import BaseAgent, AgentResponse
from ..utils.llm import LLMProvider
from ..game.state import GameState

class WarriorAgent(BaseAgent):
    def __init__(self, llm: LLMProvider):
        super().__init__(
            "warrior", "Bran Ironvale", "Warrior", llm
        )
        self.inventory = [
            "longsword", "shield", "torch", "trail_rations"
        ]

    def _get_personality(self) -> str:
        return (
            "Eres valiente, directo, protector y desconfias de la magia. "
            "Quieres recuperar el escudo perdido de tu familia. "
            "Sueles proponer planes audaces pero riesgosos."
        )

    async def respond(
        self, player_input: str, state: GameState, context: Dict[str, Any]
    ) -> AgentResponse:
        prompt = self._build_system_prompt(
            state,
            f"Tu inventario: {', '.join(self.inventory)}\n"
            f"Contexto: {context.get('scene', '')}"
        )
        narrative = await self.llm.chat(
            system_prompt=prompt,
            user_message=(
                f"El grupo esta en esta situacion: {player_input}\n"
                f"Como {self.name}, ?que haces o dices?"
            ),
            temperature=0.8,
            max_tokens=256,
        )
        return AgentResponse(narrative=narrative)
```

**src/agents/mage.py**
```python
from typing import Dict, Any
from .base import BaseAgent, AgentResponse
from ..utils.llm import LLMProvider
from ..game.state import GameState

class MageAgent(BaseAgent):
    def __init__(self, llm: LLMProvider):
        super().__init__("mage", "Lyra Vey", "Mage", llm)

    def _get_personality(self) -> str:
        return (
            "Eres curiosa, analitica y un poco arrogante. "
            "Crees que el mito del Starwell es real. "
            "Discutes con el Guerrero cuando la fuerza bruta "
            "corre el riesgo de destruir evidencia."
        )

    async def respond(
        self, player_input: str, state: GameState, context: Dict[str, Any]
    ) -> AgentResponse:
        prompt = self._build_system_prompt(
            state,
            f"Contexto arcanico: {context.get('arcane_context', '')}"
        )
        narrative = await self.llm.chat(
            system_prompt=prompt,
            user_message=(
                f"Situacion: {player_input}\n"
                f"Como {self.name}, ?que observas o sugieres?"
            ),
            temperature=0.8,
            max_tokens=256,
        )
        return AgentResponse(narrative=narrative)
```

**src/agents/rogue.py**
```python
from typing import Dict, Any
from .base import BaseAgent, AgentResponse
from ..utils.llm import LLMProvider
from ..game.state import GameState

class RogueAgent(BaseAgent):
    def __init__(self, llm: LLMProvider):
        super().__init__("rogue", "Kira Swiftfoot", "Rogue", llm)

    def _get_personality(self) -> str:
        return (
            "Eres ingeniosa, esceptica y oportunista. "
            "Tienes una conexion misteriosa con el gremio de ladrones. "
            "Notas detalles que otros personajes pasan por alto."
        )

    async def respond(
        self, player_input: str, state: GameState, context: Dict[str, Any]
    ) -> AgentResponse:
        prompt = self._build_system_prompt(
            state,
            f"Detalles del entorno: {context.get('environment', '')}"
        )
        narrative = await self.llm.chat(
            system_prompt=prompt,
            user_message=(
                f"Situacion: {player_input}\n"
                f"Como {self.name}, ?que detectas o propones?"
            ),
            temperature=0.8,
            max_tokens=256,
        )
        return AgentResponse(narrative=narrative)
```

**src/agents/healer.py**
```python
from typing import Dict, Any
from .base import BaseAgent, AgentResponse
from ..utils.llm import LLMProvider
from ..game.state import GameState

class HealerAgent(BaseAgent):
    def __init__(self, llm: LLMProvider):
        super().__init__("healer", "Sister Elara", "Healer", llm)

    def _get_personality(self) -> str:
        return (
            "Eres compasiva, observadora y con principios. "
            "Crees que el bosque maldito puede sanarse, no destruirse. "
            "Empujas al grupo a considerar las consecuencias eticas."
        )

    async def respond(
        self, player_input: str, state: GameState, context: Dict[str, Any]
    ) -> AgentResponse:
        party_status = state.get_party_summary()
        prompt = self._build_system_prompt(
            state,
            f"Estado del grupo:\n{party_status}\n"
            f"Contexto moral: {context.get('moral_context', '')}"
        )
        narrative = await self.llm.chat(
            system_prompt=prompt,
            user_message=(
                f"Situacion: {player_input}\n"
                f"Como {self.name}, ?como respondes?"
            ),
            temperature=0.8,
            max_tokens=256,
        )
        return AgentResponse(narrative=narrative)
```

**src/agents/rival.py**
```python
from typing import Dict, Any
from .base import BaseAgent, AgentResponse
from ..utils.llm import LLMProvider
from ..game.state import GameState

class RivalAgent(BaseAgent):
    def __init__(self, llm: LLMProvider):
        super().__init__("rival", "Kael Thorn", "Rival", llm)

    def _get_personality(self) -> str:
        return (
            "Eres carismatico, orgulloso e impredecible. "
            "Buscas la misma reliquia que el jugador. "
            "Sabes mas de lo que admites sobre las ruinas antiguas."
        )

    async def respond(
        self, player_input: str, state: GameState, context: Dict[str, Any]
    ) -> AgentResponse:
        trust_level = state.world_flags.get("rival_trust_level", "uncertain")
        prompt = self._build_system_prompt(
            state,
            f"Confianza del grupo hacia ti: {trust_level}\n"
            f"Tus objetivos secretos: {context.get('rival_secrets', '')}"
        )
        narrative = await self.llm.chat(
            system_prompt=prompt,
            user_message=(
                f"Situacion: {player_input}\n"
                f"Como {self.name} (rival del grupo), ?que haces o dices?"
            ),
            temperature=0.9,  # Higher temperature for unpredictability
            max_tokens=256,
        )
        return AgentResponse(narrative=narrative)
```

---

## Fase 5: API + Orquestación (Día 13-15)

### 5.1 Agent Orchestrator

**src/main.py**
```python
import os
import json
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from .config import Settings
from .utils.llm import get_llm_provider
from .utils.logging import AgentLogger
from .iq_layers.foundry_iq import FoundryIQ
from .game.state import GameState, Character, Quest, Location
from .game.rules import DiceRoller
from .game.quests import QuestManager
from .agents.game_master import GameMasterAgent
from .agents.warrior import WarriorAgent
from .agents.mage import MageAgent
from .agents.rogue import RogueAgent
from .agents.healer import HealerAgent
from .agents.rival import RivalAgent
from .synthetic_data.world import (
    WORLD_OVERVIEW, LOCATIONS, CHARACTERS, FACTIONS,
    QUESTS, ITEMS, BESTIARY, HOMEBREW_RULES,
)

load_dotenv()
settings = Settings()

app = FastAPI(
    title="Reasoning RPG - Agent Game System",
    description="Multi-agent fantasy RPG system for Microsoft Foundry challenge",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
game_state: GameState = None
agents: Dict[str, Any] = {}
logger = AgentLogger()


class PlayerAction(BaseModel):
    action: str
    campaign_id: str = "default"


class RollRequest(BaseModel):
    character_id: str
    check_type: str
    difficulty: int = 15


@app.on_event("startup")
async def startup():
    global game_state, agents

    # Initialize LLM
    llm = get_llm_provider()

    # Initialize Foundry IQ
    foundry_iq = FoundryIQ(llm)

    # Initialize agents
    agents = {
        "gm": GameMasterAgent(llm, foundry_iq),
        "warrior": WarriorAgent(llm),
        "mage": MageAgent(llm),
        "rogue": RogueAgent(llm),
        "healer": HealerAgent(llm),
        "rival": RivalAgent(llm),
    }

    # Initialize game state from synthetic data
    party = {}
    for char_data in CHARACTERS:
        char = Character(
            agent_id=char_data["id"],
            name=char_data["name"],
            role=char_data["role"],
            health=char_data["health"],
            max_health=char_data["health"],
            stamina=10,
            max_stamina=10,
            inventory=char_data.get("inventory", []),
            abilities=char_data["abilities"],
            backstory=char_data["backstory"],
            personality=char_data["personality"],
        )
        party[char_data["id"]] = char

    locations = {}
    for loc_data in LOCATIONS:
        loc = Location(**loc_data)
        locations[loc_data["id"]] = loc

    quests = {}
    for quest_data in QUESTS:
        quest = Quest(**quest_data)
        quests[quest_data["id"]] = quest

    game_state = GameState(
        campaign_id="default",
        campaign_name="The Shattered Moon of Eldervale",
        current_location="silverbrook_village",
        party=party,
        locations=locations,
        quests=quests,
        world_flags={"rival_trust_level": "uncertain"},
    )

    logger.info("Game initialized", extra={"state": game_state.campaign_name})


@app.get("/")
async def root():
    return {
        "game": "Reasoning RPG",
        "campaign": game_state.campaign_name if game_state else "Not initialized",
        "status": "ready" if game_state else "starting",
    }


@app.get("/api/state")
async def get_state():
    """Get current game state."""
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    return game_state.to_dict()


@app.post("/api/action")
async def player_action(action: PlayerAction):
    """Process a player action."""
    global game_state
    if not game_state:
        raise HTTPException(500, "Game not initialized")

    try:
        # Route through Game Master
        gm = agents["gm"]
        context = {
            "quest_summary": _get_quest_summary(),
            "scene": game_state.get_party_summary(),
        }

        # Get GM response
        gm_response = await gm.respond(
            action.action, game_state, context
        )

        # Get character agent responses based on GM selection
        selected_agents = gm._select_agents(action.action)
        character_responses = []

        for agent_id in selected_agents:
            if agent_id in agents and agent_id != "gm":
                agent = agents[agent_id]
                response = await agent.respond(
                    action.action, game_state, context
                )
                character_responses.append({
                    "agent": agent_id,
                    "name": agent.name,
                    "response": response.narrative,
                })

        # Update state
        game_state.turn_count += 1
        game_state.add_to_log(f"Player: {action.action}")
        game_state.add_to_log(f"GM: {gm_response.narrative[:100]}...")

        return {
            "turn": game_state.turn_count,
            "gm_narrative": gm_response.narrative,
            "character_responses": character_responses,
            "party_state": game_state.get_party_summary(),
        }

    except Exception as e:
        logger.error(f"Action error: {e}")
        raise HTTPException(500, str(e))


@app.post("/api/roll")
async def make_roll(request: RollRequest):
    """Make an ability check for a character."""
    if not game_state:
        raise HTTPException(500, "Game not initialized")

    character = game_state.party.get(request.character_id)
    if not character:
        raise HTTPException(404, f"Character {request.character_id} not found")

    result = DiceRoller.ability_check(
        character, request.check_type, request.difficulty
    )

    game_state.add_to_log(
        f"{character.name} rolled {request.check_type}: {result['result']}"
    )

    return result


@app.get("/api/quests")
async def get_quests():
    """Get all quests."""
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    return {qid: q.__dict__ for qid, q in game_state.quests.items()}


@app.get("/api/locations")
async def get_locations():
    """Get all locations."""
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    return {lid: loc.__dict__ for lid, loc in game_state.locations.items()}


def _get_quest_summary() -> str:
    """Build quest summary string."""
    lines = []
    for quest in game_state.quests.values():
        lines.append(
            f"- {quest.name}: {quest.status} "
            f"({len(quest.objectives)} objectives left)"
        )
    return "\n".join(lines)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=True,
    )
```

---

## Fase 6: Frontend (Día 16-18)

### 6.1 React App

**frontend/package.json**
```json
{
  "name": "reasoning-rpg-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "axios": "^1.7.0",
    "react-markdown": "^9.0.0",
    "react-dice-complete": "^1.3.0",
    "typescript": "^5.5.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}
```

**frontend/src/App.tsx**
```tsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./App.css";

const API = axios.create({ baseURL: "http://localhost:8000/api" });

interface GameState {
  campaign_name: string;
  current_location: string;
  party: Record<string, any>;
  turn_count: number;
  session_log: string[];
  quests: Record<string, any>;
}

interface CharacterResponse {
  agent: string;
  name: string;
  response: string;
}

interface ActionResponse {
  turn: number;
  gm_narrative: string;
  character_responses: CharacterResponse[];
  party_state: string;
}

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerInput, setPlayerInput] = useState("");
  const [actionResponse, setActionResponse] = useState<ActionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    API.get("/state")
      .then((res) => setGameState(res.data))
      .catch((err) => setError("Error loading game state"));
  }, []);

  const handleAction = useCallback(async () => {
    if (!playerInput.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await API.post("/action", { action: playerInput });

      const data: ActionResponse = res.data;
      setActionResponse(data);

      setHistory((prev) => [
        ...prev,
        { role: "player", content: `> ${playerInput}` },
        { role: "gm", content: data.gm_narrative },
        ...data.character_responses.map((cr) => ({
          role: cr.agent,
          content: `**${cr.name}**: ${cr.response}`,
        })),
      ]);

      setPlayerInput("");

      // Refresh state
      const stateRes = await API.get("/state");
      setGameState(stateRes.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Error processing action");
    } finally {
      setLoading(false);
    }
  }, [playerInput, loading]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          {gameState?.campaign_name || "Reasoning RPG"}
        </h1>
        <div className="game-info">
          <span>
            Turno: {gameState?.turn_count || 0} |{" "}
            Ubicación: {gameState?.current_location || "???"}
          </span>
        </div>
      </header>

      <div className="game-layout">
        <div className="sidebar">
          <h3>Estado del Grupo</h3>
          <pre>{gameState?.party_state || "Cargando..."}</pre>

          <h3>Misiones</h3>
          {gameState?.quests &&
            Object.values(gameState.quests).map((quest: any) => (
              <div key={quest.id} className="quest-card">
                <strong>{quest.name}</strong>
                <span className={`status ${quest.status}`}>
                  {quest.status}
                </span>
                <ul>
                  {quest.objectives.map((obj: string, i: number) => (
                    <li key={i}>{obj}</li>
                  ))}
                </ul>
              </div>
            ))}
        </div>

        <div className="main-content">
          <div className="log">
            {history.map((entry, i) => (
              <div key={i} className={`log-entry ${entry.role}`}>
                <div className="entry-content">{entry.content}</div>
              </div>
            ))}
            {loading && <div className="loading">Pensando...</div>}
            {error && <div className="error">{error}</div>}
          </div>

          <div className="input-area">
            <textarea
              value={playerInput}
              onChange={(e) => setPlayerInput(e.target.value)}
              placeholder="Describe tu accion..."
              disabled={loading}
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAction();
                }
              }}
            />
            <button
              onClick={handleAction}
              disabled={loading || !playerInput.trim()}
            >
              {loading ? "Procesando..." : "Actuar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
```

---

## Fase 7: Despliegue y Testing (Día 19-20)

### 7.1 Docker Setup

**Dockerfile**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**docker-compose.yml**
```yaml
version: "3.8"

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env
    volumes:
      - ./src:/app/src
      - ./data:/app/data
    command: uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - ./frontend:/app
    ports:
      - "3000:3000"
    command: sh -c "npm install && npm start"
    depends_on:
      - backend
```

### 7.2 Tests

**tests/test_agents.py**
```python
import pytest
from unittest.mock import AsyncMock

@pytest.mark.asyncio
async def test_game_master_responds():
    from src.agents.game_master import GameMasterAgent
    from src.game.state import GameState, Character

    mock_llm = AsyncMock()
    mock_llm.chat.return_value = (
        "La capilla en ruinas se alza frente a ti. "
        "El polvo cubre el suelo y un altar de plata "
        "brilla debilmente bajo la luz de la luna."
    )

    gm = GameMasterAgent(mock_llm, None)
    state = GameState(
        campaign_id="test",
        campaign_name="Test Campaign",
        current_location="ruined_chapel",
    )

    response = await gm.respond(
        "Entro en la capilla y busco pistas.",
        state,
        {},
    )

    assert response.narrative is not None
    assert len(response.narrative) > 0
    assert mock_llm.chat.called


@pytest.mark.asyncio
async def test_dice_roller():
    from src.game.rules import DiceRoller

    result = DiceRoller.ability_check(
        Character(
            agent_id="test",
            name="Test",
            role="Warrior",
            health=20, max_health=20,
            stamina=10, max_stamina=10,
            abilities={"strength": 3},
        ),
        "strength",
        15,
    )

    assert result["actor"] == "Test"
    assert result["check"] == "strength"
    assert result["difficulty"] == 15
    assert 1 <= result["roll"] <= 20
    assert result["result"] in [
        "critical_success", "success",
        "partial_success", "failure", "critical_failure",
    ]


@pytest.mark.asyncio
async def test_game_state():
    from src.game.state import GameState, Character

    state = GameState(
        campaign_id="test",
        campaign_name="Test",
        current_location="start",
    )

    char = Character(
        agent_id="hero",
        name="Hero",
        role="Adventurer",
        health=20, max_health=20,
        stamina=10, max_stamina=10,
    )
    state.party["hero"] = char

    summary = state.get_party_summary()
    assert "Hero" in summary
    assert "HP: 20/20" in summary

    state.add_to_log("Test entry")
    assert len(state.session_log) == 1
```

### 7.3 .gitignore
```gitignore
# Python
__pycache__/
*.py[cod]
*.egg-info/
.venv/
venv/

# Environment
.env

# Database
*.db
*.sqlite

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Node
node_modules/
frontend/node_modules/
frontend/build/

# Docker
data/
```

---

## Roadmap de Construcción

| Fase | Tiempo | Entregable | Archivos |
|------|--------|------------|----------|
| **1. Fundación** | 2 días | Estructura, config, LLM provider | 6 archivos |
| **2. Core del Juego** | 3 días | GameState, dice, combat, quests | 3 archivos |
| **3. Foundry IQ** | 2 días | IQ layer + datos sintéticos | 8 archivos |
| **4. Agentes** | 4 días | 6 agentes (GM + 5 personajes) | 7 archivos |
| **5. API** | 3 días | FastAPI endpoints, orquestación | 1 archivo + tests |
| **6. Frontend** | 3 días | React app con chat RPG | 3 archivos |
| **7. Despliegue** | 2 días | Docker, tests, documentación | 5 archivos |
| **Total** | **19-20 días** | MVP completo | ~33 archivos |

---

## Próximos Pasos Inmediatos

```bash
# 1. Crear estructura
mkdir -p reasoning-rpg/src/{agents,game,iq_layers,synthetic_data,utils}
mkdir -p reasoning-rpg/tests
mkdir -p reasoning-rpg/frontend/src/{components,services,hooks}

# 2. Crear entorno virtual
cd reasoning-rpg
python -m venv .venv
.venv\Scripts\activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Crear .env con clave de OpenRouter
echo "OPENROUTER_API_KEY=sk-or-v1-tu-key-aqui" > .env

# 5. Iniciar servidor
uvicorn src.main:app --reload

# 6. Jugar!
curl http://localhost:8000/
curl http://localhost:8000/api/state
curl -X POST http://localhost:8000/api/action \
  -H "Content-Type: application/json" \
  -d '{"action": "Exploro la capilla en ruinas"}'
```

---

## Resumen de Alineación con el Challenge

| Requisito del Challenge | Cómo lo Cumple |
|------------------------|----------------|
| Multi-agent system | 6 agentes (GM, Warrior, Mage, Rogue, Healer, Rival) |
| Microsoft Foundry | FoundryProvider listo, intercambiable con OpenRouter |
| Foundry IQ integration | Capa de conocimiento sintético con el mundo RPG |
| Razonamiento multi-step | Game Master orquesta, agentes responden en personaje |
| Datos sintéticos | Mundo original completo (Eldervale) |
| Demoable | FastAPI + React frontend |
| Documentación | Este documento + README |
| Despliegue | Docker + Foundry Agent Service ready |

**Diferencia clave**: Usamos OpenRouter para desarrollo (gratuito) y Microsoft Foundry se activa con solo cambiar la variable de entorno.
