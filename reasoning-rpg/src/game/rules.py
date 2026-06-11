import random
import re
from typing import Dict, Any, Optional, Tuple
from .state import CheckResult, Character, CombatEnemy


class DiceRoller:
    @staticmethod
    def roll(dice: str) -> int:
        match = re.match(r"(\d+)d(\d+)", dice)
        if not match:
            raise ValueError(f"Invalid dice format: {dice}")
        count, sides = int(match.group(1)), int(match.group(2))
        return sum(random.randint(1, sides) for _ in range(count))

    @staticmethod
    def roll_with_advantage(dice: str) -> Tuple[int, int, int]:
        r1 = DiceRoller.roll(dice)
        r2 = DiceRoller.roll(dice)
        return r1, r2, max(r1, r2)

    @staticmethod
    def roll_with_disadvantage(dice: str) -> Tuple[int, int, int]:
        r1 = DiceRoller.roll(dice)
        r2 = DiceRoller.roll(dice)
        return r1, r2, min(r1, r2)

    @staticmethod
    def ability_check(
        character: "Character", ability: str, difficulty: int
    ) -> Dict[str, Any]:
        modifier = character.abilities.get(ability, 0)
        roll = DiceRoller.roll("1d20")
        total = roll + modifier

        if roll == 20:
            result = CheckResult.CRITICAL_SUCCESS
        elif roll == 1:
            result = CheckResult.CRITICAL_FAILURE
        elif total >= difficulty + 5:
            result = CheckResult.SUCCESS
        elif total >= difficulty:
            result = CheckResult.PARTIAL_SUCCESS
        else:
            result = CheckResult.FAILURE

        return {
            "actor": character.name,
            "check": ability,
            "roll": roll,
            "modifier": modifier,
            "total": total,
            "difficulty": difficulty,
            "result": result.value,
        }

    @staticmethod
    def attack_roll(
        attacker: "Character", defender: "Character"
    ) -> Dict[str, Any]:
        attack_roll = DiceRoller.roll("1d20")
        attack_mod = attacker.abilities.get("strength", 0)
        attack_total = attack_roll + attack_mod
        defense_mod = defender.abilities.get("dexterity", 0)
        defense_dc = 10 + defense_mod
        hit = attack_total >= defense_dc
        if hit:
            damage = DiceRoller.roll("1d8") + attacker.abilities.get("strength", 0)
        else:
            damage = 0

        return {
            "attacker": attacker.name,
            "defender": defender.name,
            "attack_roll": attack_roll,
            "attack_total": attack_total,
            "defense_dc": defense_dc,
            "hit": hit,
            "damage": damage,
        }

    @staticmethod
    def enemy_attack(
        enemy: CombatEnemy, target: "Character"
    ) -> Dict[str, Any]:
        attack_roll = DiceRoller.roll("1d20")
        attack_mod = enemy.abilities.get("strength", 4)
        attack_total = attack_roll + attack_mod
        defense_mod = target.abilities.get("dexterity", 0)
        defense_dc = 10 + defense_mod
        hit = attack_total >= defense_dc
        if hit:
            damage = DiceRoller.roll("1d6") + attack_mod // 2
        else:
            damage = 0

        return {
            "attacker": enemy.name,
            "defender": target.name,
            "attack_roll": attack_roll,
            "attack_total": attack_total,
            "defense_dc": defense_dc,
            "hit": hit,
            "damage": damage,
        }

    @staticmethod
    def heal(healer: "Character", target: "Character") -> int:
        wisdom = healer.abilities.get("wisdom", 2)
        amount = DiceRoller.roll("1d8") + wisdom
        target.health = min(target.max_health, target.health + amount)
        return amount

    @staticmethod
    def rest_recovery(character: "Character", is_long_rest: bool = False):
        if is_long_rest:
            character.health = character.max_health
            character.stamina = character.max_stamina
            character.conditions.clear()
        else:
            recovery = DiceRoller.roll("1d8") + character.abilities.get("constitution", 0)
            character.health = min(character.max_health, character.health + recovery)
