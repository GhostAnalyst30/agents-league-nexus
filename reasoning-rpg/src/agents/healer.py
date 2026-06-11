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
