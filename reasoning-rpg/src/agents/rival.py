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
            temperature=0.9,
            max_tokens=256,
        )
        return AgentResponse(narrative=narrative)
