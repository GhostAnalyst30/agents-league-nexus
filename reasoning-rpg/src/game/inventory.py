from typing import Dict, List, Optional, Any
from .state import Character, GameState
from .rules import DiceRoller


class InventoryManager:
    MAX_ITEMS = 10
    MAX_STACK = 5

    @staticmethod
    def add_item(character: Character, item: str) -> bool:
        if len(character.inventory) >= InventoryManager.MAX_ITEMS:
            return False
        character.inventory.append(item)
        return True

    @staticmethod
    def remove_item(character: Character, item: str) -> bool:
        if item in character.inventory:
            character.inventory.remove(item)
            return True
        return False

    @staticmethod
    def has_item(character: Character, item: str) -> bool:
        return item in character.inventory

    @staticmethod
    def get_summary(character: Character) -> str:
        if not character.inventory:
            return f"{character.name} carries nothing."
        items = ", ".join(character.inventory)
        return f"{character.name}'s inventory: {items}"

    @staticmethod
    def use_item(state: GameState, character_id: str, item_name: str, target_id: Optional[str] = None) -> Dict[str, Any]:
        character = state.party.get(character_id)
        if not character:
            return {"error": "Character not found"}
        if item_name not in character.inventory:
            return {"error": f"{character.name} doesn't have {item_name}"}

        item_effects = {
            "healing_potion": {"heal": "2d4+2", "type": "consumable"},
            "silver_herb": {"heal": "1d4", "type": "consumable"},
            "trail_rations": {"stamina": "1d6", "type": "consumable"},
            "scroll_of_light": {"damage_undead": "3d6", "type": "magic"},
            "smoke_bomb": {"escape": True, "type": "consumable"},
        }

        effect = item_effects.get(item_name)
        if not effect:
            return {"error": f"{item_name} has no defined effect"}

        if effect.get("type") == "consumable" or effect.get("type") == "magic":
            character.inventory.remove(item_name)

        result = {"item": item_name, "used_by": character.name}

        if "heal" in effect:
            dice_str = effect["heal"]
            import re
            match = re.match(r"(\d+)d(\d+)([+-]\d+)?", dice_str)
            if match:
                count = int(match.group(1))
                sides = int(match.group(2))
                bonus = int(match.group(3)) if match.group(3) else 0
                amount = sum(DiceRoller.roll(f"1d{sides}") for _ in range(count)) + bonus
            else:
                amount = 4

            if target_id and target_id in state.party:
                target = state.party[target_id]
                target.health = min(target.max_health, target.health + amount)
                result["healed"] = amount
                result["target"] = target.name
                result["target_hp"] = f"{target.health}/{target.max_health}"
            else:
                character.health = min(character.max_health, character.health + amount)
                result["healed"] = amount
                result["target"] = character.name
                result["target_hp"] = f"{character.health}/{character.max_health}"

        if "stamina" in effect:
            import re
            match = re.match(r"(\d+)d(\d+)", effect["stamina"])
            if match:
                amount = DiceRoller.roll(effect["stamina"])
                character.stamina = min(character.max_stamina, character.stamina + amount)
                result["stamina_restored"] = amount

        state.add_to_log(f"{character.name} used {item_name}")
        return result

    @staticmethod
    def pickup_item(state: GameState, character_id: str, item: str) -> Dict[str, Any]:
        loc = state.get_current_location_obj()
        character = state.party.get(character_id)
        if not character:
            return {"error": "Character not found"}
        if not loc:
            return {"error": "Location not found"}
        if item not in loc.items:
            return {"error": f"{item} is not here"}

        if not InventoryManager.add_item(character, item):
            return {"error": f"{character.name}'s inventory is full"}

        loc.items.remove(item)
        state.add_to_log(f"{character.name} picked up {item}")
        return {
            "success": True,
            "character": character.name,
            "item": item,
            "inventory": character.inventory.copy(),
        }

    @staticmethod
    def drop_item(state: GameState, character_id: str, item: str) -> Dict[str, Any]:
        character = state.party.get(character_id)
        loc = state.get_current_location_obj()
        if not character:
            return {"error": "Character not found"}
        if not loc:
            return {"error": "Location not found"}

        if not InventoryManager.remove_item(character, item):
            return {"error": f"{character.name} doesn't have {item}"}

        loc.items.append(item)
        state.add_to_log(f"{character.name} dropped {item}")
        return {
            "success": True,
            "character": character.name,
            "item": item,
        }
