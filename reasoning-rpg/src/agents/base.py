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
