import random
from typing import Dict, Any, Optional, List
from .state import GameState, Location
from .rules import DiceRoller


class NavigationManager:
    @staticmethod
    def get_available_exits(state: GameState) -> List[Dict[str, str]]:
        loc = state.get_current_location_obj()
        if not loc:
            return []
        exits = []
        for direction, target_id in loc.exits.items():
            target = state.locations.get(target_id)
            if target:
                exits.append({
                    "direction": direction,
                    "id": target_id,
                    "name": target.name,
                    "description": target.description[:80],
                })
        return exits

    @staticmethod
    def get_location_info(state: GameState) -> Dict[str, Any]:
        loc = state.get_current_location_obj()
        if not loc:
            return {"error": "Location not found"}
        return {
            "id": loc.id,
            "name": loc.name,
            "description": loc.description,
            "type": loc.type,
            "region": loc.region,
            "npcs": loc.npcs,
            "items": loc.items,
            "secrets": loc.secrets,
            "exits": NavigationManager.get_available_exits(state),
        }

    @staticmethod
    def move(state: GameState, direction: str) -> Dict[str, Any]:
        loc = state.get_current_location_obj()
        if not loc:
            return {"error": "Current location not found"}

        target_id = loc.exits.get(direction)
        if not target_id:
            return {"error": f"Cannot go {direction} from here"}

        target = state.locations.get(target_id)
        if not target:
            return {"error": f"Location {target_id} not found in world"}

        old_name = loc.name
        state.current_location = target_id
        state.add_to_log(f"Moved from {old_name} to {target.name}")

        result = {
            "success": True,
            "from": old_name,
            "to": target.name,
            "description": target.description,
            "exits": NavigationManager.get_available_exits(state),
            "items_here": target.items,
            "npcs_here": target.npcs,
        }

        if target.encounters and random.random() < 0.4:
            encounter = random.choice(target.encounters)
            result["encounter"] = encounter

        return result

    @staticmethod
    def search_location(state: GameState) -> Dict[str, Any]:
        loc = state.get_current_location_obj()
        if not loc:
            return {"error": "Location not found"}

        char = state.party.get("rogue") or state.party.get("warrior")
        if not char:
            return {"error": "No party member available to search"}

        check = DiceRoller.ability_check(char, "intelligence", 12)

        found = []
        if check["result"] in ("critical_success", "success"):
            for item in loc.items:
                found.append(item)
            if loc.secrets:
                found.append(f"Secret discovered: {loc.secrets[0]}")
        elif check["result"] == "partial_success":
            if loc.items:
                found.append(loc.items[0])

        return {
            "result": check["result"],
            "roll": check,
            "found": found,
        }

    @staticmethod
    def talk_to_npc(state: GameState, npc_name: str) -> Dict[str, Any]:
        loc = state.get_current_location_obj()
        if not loc:
            return {"error": "Location not found"}
        if npc_name not in loc.npcs:
            return {"error": f"{npc_name} is not here"}

        npc_dialogues = {
            "Elder Maren": (
                f"Welcome to {loc.name}, traveler. The Frostwood has grown "
                "restless lately. Strange lights in the trees at night.",
            ),
            "Brom the Blacksmith": (
                "Need a weapon sharpened? Or perhaps you're looking for "
                "information about the old ruins to the north?",
            ),
            "Sister Lys": (
                "The Silver Root protects us. If you seek the Moonlit Gate, "
                "speak three truths that contradict each other.",
            ),
            "Wandering Merchant": (
                "Fine wares from across Eldervale! I've heard whispers of "
                "a hidden grove with a Starfall Shard in these woods.",
            ),
        }

        dialogue = npc_dialogues.get(npc_name, f"{npc_name} greets you warmly.")
        state.add_to_log(f"Talked to {npc_name}")

        return {
            "npc": npc_name,
            "dialogue": dialogue,
            "location": loc.name,
        }
