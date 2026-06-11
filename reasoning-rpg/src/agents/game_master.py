from typing import Dict, Any, Optional
from .base import BaseAgent, AgentResponse
from ..utils.llm import LLMProvider
from ..game.state import GameState, Character
from ..game.rules import DiceRoller
from ..iq_layers.foundry_iq import FoundryIQ

class GameMasterAgent(BaseAgent):
    def __init__(self, llm: LLMProvider, foundry_iq: FoundryIQ):
        super().__init__("gm", "Game Master", "Orchestrator", llm)
        self.foundry_iq = foundry_iq
        self.dice = DiceRoller()

    async def respond(
        self, player_input: str, state: GameState, context: Dict[str, Any]
    ) -> AgentResponse:
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

        agents_to_call = self._select_agents(player_input)

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
