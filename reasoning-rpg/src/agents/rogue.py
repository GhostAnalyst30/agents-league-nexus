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
