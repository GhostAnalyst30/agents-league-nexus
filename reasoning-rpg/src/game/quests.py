import json
from typing import Dict, List, Optional, Any
from .state import Quest, GameState


class QuestManager:
    def __init__(self):
        self.quests: Dict[str, Quest] = {}

    def add_quest(self, quest: Quest):
        self.quests[quest.id] = quest

    def get_active_quests(self) -> List[Quest]:
        return [q for q in self.quests.values() if q.status == "active"]

    def get_completed_quests(self) -> List[Quest]:
        return [q for q in self.quests.values() if q.status == "completed"]

    def complete_objective(self, quest_id: str, objective: str) -> Dict[str, Any]:
        quest = self.quests.get(quest_id)
        if not quest or quest.status != "active":
            return {"error": "Quest not found or not active"}

        if objective in quest.objectives:
            quest.objectives.remove(objective)
            quest.clues.append(f"Objective completed: {objective}")

            remaining = len(quest.objectives)
            total = len(quest.original_objectives) if quest.original_objectives else remaining + 1
            progress = f"{total - remaining}/{total}"

            if not quest.objectives:
                quest.status = "completed"
                quest.clues.append("QUEST COMPLETED!")
                return {
                    "success": True,
                    "quest_completed": True,
                    "quest_name": quest.name,
                    "objective": objective,
                    "progress": "COMPLETE",
                }

            return {
                "success": True,
                "quest_completed": False,
                "quest_name": quest.name,
                "objective": objective,
                "progress": progress,
            }

        return {"error": f"Objective '{objective}' not found in quest"}

    def fail_quest(self, quest_id: str) -> bool:
        quest = self.quests.get(quest_id)
        if not quest:
            return False
        quest.status = "failed"
        return True

    def get_quest_summary(self) -> str:
        lines = []
        for quest in self.quests.values():
            status_icon = {"active": "🔄", "completed": "✅", "failed": "❌"}
            icon = status_icon.get(quest.status, "❓")
            remaining = len(quest.objectives)
            total = len(quest.original_objectives) or remaining
            lines.append(
                f"{icon} {quest.name}: {quest.status} "
                f"({total - remaining}/{total} objectives)"
            )
        return "\n".join(lines) if lines else "No quests."

    @staticmethod
    def check_auto_progress(state: GameState) -> List[Dict[str, Any]]:
        updates = []

        for qid, quest in state.quests.items():
            if quest.status != "active":
                continue

            loc = state.get_current_location_obj()
            loc_name = loc.name.lower() if loc else ""

            for obj in quest.objectives[:]:
                obj_lower = obj.lower()

                if "enter" in obj_lower and loc_name and any(w in loc_name for w in obj_lower.split()):
                    if "moonlit" in loc_name and "moonlit gate" in obj_lower:
                        qm = QuestManager()
                        result = qm.complete_objective(qid, obj)
                        if result.get("success"):
                            updates.append(result)

                if "talk" in obj_lower and loc:
                    for npc in loc.npcs:
                        if npc.lower() in obj_lower:
                            qm = QuestManager()
                            result = qm.complete_objective(qid, obj)
                            if result.get("success"):
                                updates.append(result)

            state.quests[qid] = quest

        return updates
