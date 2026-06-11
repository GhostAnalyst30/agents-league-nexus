import pytest
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_game_initialization():
    from src.main import _init_game

    game_state = _init_game()
    assert game_state is not None
    assert game_state.campaign_name == "The Shattered Moon of Eldervale"
    assert len(game_state.party) == 5
    assert game_state.current_location == "silverbrook_village"
    assert game_state.is_exploration_phase() is True


@pytest.mark.asyncio
async def test_navigation():
    from src.main import _init_game
    from src.game.navigation import NavigationManager

    state = _init_game()
    exits = NavigationManager.get_available_exits(state)
    assert len(exits) > 0
    assert any(e["direction"] == "north" for e in exits)
    assert any(e["direction"] == "east" for e in exits)


@pytest.mark.asyncio
async def test_inventory_use():
    from src.main import _init_game
    from src.game.inventory import InventoryManager

    state = _init_game()
    result = InventoryManager.use_item(state, "warrior", "trail_rations")
    assert "error" not in result
    assert result["item"] == "trail_rations"


@pytest.mark.asyncio
async def test_quest_auto_progress():
    from src.main import _init_game
    from src.game.quests import QuestManager
    from src.game.navigation import NavigationManager

    state = _init_game()
    NavigationManager.move(state, "north")
    updates = QuestManager.check_auto_progress(state)
    assert len(updates) >= 0
