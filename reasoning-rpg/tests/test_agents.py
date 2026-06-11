import pytest
from unittest.mock import AsyncMock

@pytest.mark.asyncio
async def test_combat_manager():
    from src.game.combat import CombatManager
    from src.game.state import GameState, Character

    state = GameState(
        campaign_id="test",
        campaign_name="Test",
        current_location="test_loc",
        party={
            "warrior": Character(
                agent_id="warrior",
                name="Bran",
                role="Warrior",
                health=25,
                max_health=25,
                stamina=10,
                max_stamina=10,
                abilities={"strength": 5, "dexterity": 2},
                inventory=["longsword", "shield"],
            ),
            "mage": Character(
                agent_id="mage",
                name="Lyra",
                role="Mage",
                health=14,
                max_health=14,
                stamina=10,
                max_stamina=10,
                abilities={"intelligence": 5, "dexterity": 2},
                inventory=["spellbook"],
            ),
        },
    )

    result = CombatManager.start_combat(state, ["frostwolf"])
    assert result["combat_started"] is True
    assert state.combat.active is True
    assert len(state.combat.enemies) == 1
    assert "frostwolf" in state.combat.enemies
