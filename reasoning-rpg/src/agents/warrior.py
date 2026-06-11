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
