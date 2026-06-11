from typing import Dict, Any, List
from ..game.state import GameState

class WorkIQ:
    def __init__(self):
        self.conversation_history: List[Dict[str, str]] = []
        self.max_history = 50

    def add_interaction(self, role: str, content: str):
        self.conversation_history.append({"role": role, "content": content})
        if len(self.conversation_history) > self.max_history:
            self.conversation_history.pop(0)

    def get_recent_context(self, turns: int = 5) -> str:
        recent = self.conversation_history[-turns:] if turns > 0 else []
        lines = []
        for entry in recent:
            lines.append(f"[{entry['role']}]: {entry['content'][:150]}")
        return "\n".join(lines)

    def build_context(self, state: GameState) -> Dict[str, Any]:
        return {
            "current_location": state.current_location,
            "turn": state.turn_count,
            "party": [c.name for c in state.party.values()],
            "recent_events": self.get_recent_context(),
        }
