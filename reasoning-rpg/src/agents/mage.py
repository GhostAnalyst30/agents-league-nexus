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
