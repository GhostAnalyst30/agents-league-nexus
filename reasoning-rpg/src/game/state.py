from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Any
from enum import Enum


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
    experience: int = 0
    level: int = 1
    gold: int = 0
    inventory: List[str] = field(default_factory=list)
    equipped: Dict[str, str] = field(default_factory=dict)
    abilities: Dict[str, int] = field(default_factory=dict)
    backstory: str = ""
    personality: str = ""
    conditions: List[str] = field(default_factory=list)


@dataclass
class Location:
    id: str
    name: str
    description: str
    type: str = ""
    region: str = ""
    exits: Dict[str, str] = field(default_factory=dict)
    npcs: List[str] = field(default_factory=list)
    items: List[str] = field(default_factory=list)
    secrets: List[str] = field(default_factory=list)
    encounters: List[Dict[str, Any]] = field(default_factory=list)


@dataclass
class Quest:
    id: str
    name: str
    description: str
    status: str = "active"
    objectives: List[str] = field(default_factory=list)
    original_objectives: List[str] = field(default_factory=list)
    clues: List[str] = field(default_factory=list)
    rewards: List[str] = field(default_factory=list)


@dataclass
class CombatEnemy:
    id: str
    name: str
    health: int
    max_health: int
    abilities: Dict[str, int] = field(default_factory=dict)
    weaknesses: List[str] = field(default_factory=list)
    loot: List[str] = field(default_factory=list)
    behavior: str = ""


@dataclass
class CombatState:
    active: bool = False
    enemies: Dict[str, CombatEnemy] = field(default_factory=dict)
    initiative_order: List[str] = field(default_factory=list)
    current_turn_index: int = 0
    turn_number: int = 1
    combat_log: List[str] = field(default_factory=list)
    victory: bool = False
    defeat: bool = False


@dataclass
class GameState:
    campaign_id: str
    campaign_name: str
    current_location: str
    party: Dict[str, Character] = field(default_factory=dict)
    locations: Dict[str, Location] = field(default_factory=dict)
    quests: Dict[str, Quest] = field(default_factory=dict)
    combat: CombatState = field(default_factory=CombatState)
    world_flags: Dict[str, Any] = field(default_factory=dict)
    faction_reputation: Dict[str, int] = field(default_factory=dict)
    turn_count: int = 0
    session_log: List[str] = field(default_factory=list)
    game_over: bool = False

    def to_dict(self) -> dict:
        d = asdict(self)
        d["party_state"] = self.get_party_summary()
        return d

    def add_to_log(self, entry: str):
        self.session_log.append(f"[Turn {self.turn_count}] {entry}")

    def get_character(self, agent_id: str) -> Optional[Character]:
        return self.party.get(agent_id)

    def get_party_summary(self) -> str:
        lines = []
        for char in self.party.values():
            cond = f" [{', '.join(char.conditions)}]" if char.conditions else ""
            lines.append(
                f"{char.name} ({char.role}) "
                f"HP: {char.health}/{char.max_health} "
                f"ST: {char.stamina}/{char.max_stamina}"
                f"{cond}"
            )
        return "\n".join(lines)

    def get_current_location_obj(self) -> Optional[Location]:
        return self.locations.get(self.current_location)

    def is_exploration_phase(self) -> bool:
        return not self.combat.active and not self.game_over

    def is_combat_phase(self) -> bool:
        return self.combat.active and not self.game_over
