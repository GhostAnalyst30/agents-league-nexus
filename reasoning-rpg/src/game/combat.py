from typing import Dict, List, Any, Optional, Tuple
from .state import GameState, CombatState, CombatEnemy, Character
from .rules import DiceRoller


class CombatManager:
    @staticmethod
    def start_combat(state: GameState, enemy_ids: List[str]) -> Dict[str, Any]:
        from ..synthetic_data.world import BESTIARY

        enemies = {}
        for eid in enemy_ids:
            template = next((e for e in BESTIARY if e["id"] == eid), None)
            if template:
                enemies[eid] = CombatEnemy(
                    id=template["id"],
                    name=template["name"],
                    health=template["health"],
                    max_health=template["health"],
                    abilities=template.get("abilities", {}),
                    weaknesses=template.get("weaknesses", []),
                    loot=template.get("loot", []),
                    behavior=template.get("behavior", ""),
                )

        if not enemies:
            return {"error": "No valid enemies found"}

        initiative_order = []
        for cid in state.party:
            char = state.party[cid]
            init = DiceRoller.roll("1d20") + char.abilities.get("dexterity", 0)
            initiative_order.append((init, f"party:{cid}"))
        for eid in enemies:
            enemy = enemies[eid]
            init = DiceRoller.roll("1d20") + enemy.abilities.get("dexterity", 0)
            initiative_order.append((init, f"enemy:{eid}"))

        initiative_order.sort(key=lambda x: x[0], reverse=True)
        ordered_ids = [x[1] for x in initiative_order]

        state.combat = CombatState(
            active=True,
            enemies=enemies,
            initiative_order=ordered_ids,
            current_turn_index=0,
            turn_number=1,
            combat_log=[f"COMBAT STARTED! Initiative: {', '.join(ordered_ids)}"],
        )

        state.add_to_log(f"Combat started against {', '.join(e.name for e in enemies.values())}")

        return {
            "combat_started": True,
            "enemies": [{"id": e.id, "name": e.name, "health": e.health, "max_health": e.max_health} for e in enemies.values()],
            "initiative_order": ordered_ids,
            "current_turn": ordered_ids[0],
        }

    @staticmethod
    def get_current_turn_info(state: GameState) -> Dict[str, Any]:
        if not state.combat.active:
            return {"in_combat": False}
        return {
            "in_combat": True,
            "current_turn": state.combat.initiative_order[state.combat.current_turn_index],
            "turn_number": state.combat.turn_number,
            "enemies": {eid: {"name": e.name, "health": e.health, "max_health": e.max_health} for eid, e in state.combat.enemies.items()},
            "party": {pid: {"name": c.name, "health": c.health, "max_health": c.max_health} for pid, c in state.party.items()},
            "log": state.combat.combat_log[-10:],
        }

    @staticmethod
    def execute_turn(state: GameState, action: str, target_id: Optional[str] = None) -> Dict[str, Any]:
        if not state.combat.active:
            return {"error": "Not in combat"}

        turn_owner = state.combat.initiative_order[state.combat.current_turn_index]
        results = []

        if turn_owner.startswith("party:"):
            char_id = turn_owner.split(":")[1]
            char = state.party.get(char_id)
            if not char:
                return {"error": f"Character {char_id} not found"}

            if action == "attack":
                if target_id and target_id in state.combat.enemies:
                    enemy = state.combat.enemies[target_id]
                    result = DiceRoller.ability_check(char, "strength", 12)
                    if result["result"] in ("critical_success", "success", "partial_success"):
                        damage = DiceRoller.roll("1d8") + char.abilities.get("strength", 0)
                        enemy.health -= damage
                        msg = f"{char.name} hits {enemy.name} for {damage} damage!"
                        results.append(msg)
                        state.combat.combat_log.append(msg)
                        if enemy.health <= 0:
                            msg2 = f"{enemy.name} is defeated!"
                            results.append(msg2)
                            state.combat.combat_log.append(msg2)
                    else:
                        msg = f"{char.name} misses {enemy.name}!"
                        results.append(msg)
                        state.combat.combat_log.append(msg)
                else:
                    return {"error": "No valid target"}

            elif action == "defend":
                char.conditions.append("defending")
                msg = f"{char.name} takes a defensive stance! (+2 AC until next turn)"
                results.append(msg)
                state.combat.combat_log.append(msg)

            elif action == "heal":
                if target_id and target_id in state.party:
                    target = state.party[target_id]
                    amount = DiceRoller.heal(char, target)
                    msg = f"{char.name} heals {target.name} for {amount} HP!"
                    results.append(msg)
                    state.combat.combat_log.append(msg)
                else:
                    return {"error": "No valid target for heal"}

            elif action == "magic":
                if target_id and target_id in state.combat.enemies:
                    enemy = state.combat.enemies[target_id]
                    result = DiceRoller.ability_check(char, "intelligence", 12)
                    if result["result"] in ("critical_success", "success", "partial_success"):
                        damage = DiceRoller.roll("2d6") + char.abilities.get("intelligence", 0)
                        enemy.health -= damage
                        msg = f"{char.name} casts a spell at {enemy.name} for {damage} damage!"
                        results.append(msg)
                        state.combat.combat_log.append(msg)
                        if enemy.health <= 0:
                            msg2 = f"{enemy.name} is defeated!"
                            results.append(msg2)
                            state.combat.combat_log.append(msg2)
                    else:
                        msg = f"{char.name}'s spell fizzles!"
                        results.append(msg)
                        state.combat.combat_log.append(msg)
                else:
                    return {"error": "No valid target for magic"}

            elif action == "sneak":
                if target_id and target_id in state.combat.enemies:
                    enemy = state.combat.enemies[target_id]
                    result = DiceRoller.ability_check(char, "dexterity", 12)
                    if result["result"] in ("critical_success", "success"):
                        damage = DiceRoller.roll("2d6") + char.abilities.get("dexterity", 0)
                        enemy.health -= damage
                        msg = f"{char.name} sneak attacks {enemy.name} for {damage} damage!"
                        results.append(msg)
                        state.combat.combat_log.append(msg)
                        if enemy.health <= 0:
                            msg2 = f"{enemy.name} is defeated!"
                            results.append(msg2)
                            state.combat.combat_log.append(msg2)
                    else:
                        msg = f"{char.name} tries to sneak but is spotted!"
                        results.append(msg)
                        state.combat.combat_log.append(msg)

        elif turn_owner.startswith("enemy:"):
            eid = turn_owner.split(":")[1]
            enemy = state.combat.enemies.get(eid)
            if not enemy or enemy.health <= 0:
                state.combat.current_turn_index = (state.combat.current_turn_index + 1) % len(state.combat.initiative_order)
                return {"enemy_defeated": True}

            alive_allies = [pid for pid, c in state.party.items() if c.health > 0]
            if not alive_allies:
                state.combat.defeat = True
                state.combat.combat_log.append("DEFEAT - All party members are down!")
                state.game_over = True
                return {"defeat": True}

            target_id = alive_allies[0]
            target = state.party[target_id]
            atk = DiceRoller.enemy_attack(enemy, target)
            if "defending" in target.conditions:
                atk["defense_dc"] += 2
                atk["hit"] = atk["attack_total"] >= atk["defense_dc"]
            if atk["hit"]:
                target.health -= atk["damage"]
                msg = f"{enemy.name} attacks {target.name} for {atk['damage']} damage! ({target.health}/{target.max_health} HP)"
                results.append(msg)
                state.combat.combat_log.append(msg)
                if target.health <= 0:
                    target.conditions.append("unconscious")
                    msg2 = f"{target.name} is unconscious!"
                    results.append(msg2)
                    state.combat.combat_log.append(msg2)
            else:
                msg = f"{enemy.name} attacks {target.name} but misses!"
                results.append(msg)
                state.combat.combat_log.append(msg)

        state.combat.current_turn_index = (state.combat.current_turn_index + 1) % len(state.combat.initiative_order)
        if state.combat.current_turn_index == 0:
            state.combat.turn_number += 1

        for char in state.party.values():
            if "defending" in char.conditions:
                char.conditions.remove("defending")

        combat_over = CombatManager._check_combat_end(state)
        return {
            "turn_complete": True,
            "results": results,
            "current_turn": state.combat.initiative_order[state.combat.current_turn_index],
            "turn_number": state.combat.turn_number,
            "combat_over": combat_over,
            "victory": state.combat.victory,
            "defeat": state.combat.defeat,
        }

    @staticmethod
    def _check_combat_end(state: GameState) -> bool:
        alive_enemies = [e for e in state.combat.enemies.values() if e.health > 0]
        alive_allies = [c for c in state.party.values() if c.health > 0]

        if not alive_enemies:
            state.combat.victory = True
            state.combat.active = False
            loot = []
            for e in state.combat.enemies.values():
                if e.health <= 0:
                    loot.extend(e.loot)
                    for char in alive_allies:
                        char.experience += 25
            state.combat.combat_log.append("VICTORY!")
            state.combat.combat_log.append(f"Loot: {', '.join(loot) if loot else 'Nothing'}")
            for char in alive_allies:
                char.gold += 10 * state.combat.turn_number
            return True

        if not alive_allies:
            state.combat.defeat = True
            state.combat.active = False
            state.game_over = True
            state.combat.combat_log.append("DEFEAT - Game Over!")
            return True

        return False

    @staticmethod
    def flee(state: GameState) -> bool:
        char = state.party.get("warrior")
        if char:
            check = DiceRoller.ability_check(char, "dexterity", 12)
            if check["result"] in ("critical_success", "success", "partial_success"):
                state.combat.active = False
                state.combat.combat_log.append("Party fled from combat!")
                state.add_to_log("Party fled from combat!")
                return True
        state.combat.combat_log.append("Failed to flee!")
        return False
