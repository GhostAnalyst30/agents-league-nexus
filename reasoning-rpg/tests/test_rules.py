import pytest
from src.game.state import Character

@pytest.mark.asyncio
async def test_dice_roller():
    from src.game.rules import DiceRoller

    result = DiceRoller.ability_check(
        Character(
            agent_id="test",
            name="Test",
            role="Warrior",
            health=20, max_health=20,
            stamina=10, max_stamina=10,
            abilities={"strength": 3},
        ),
        "strength",
        15,
    )

    assert result["actor"] == "Test"
    assert result["check"] == "strength"
    assert result["difficulty"] == 15
    assert 1 <= result["roll"] <= 20
    assert result["result"] in [
        "critical_success", "success",
        "partial_success", "failure", "critical_failure",
    ]
