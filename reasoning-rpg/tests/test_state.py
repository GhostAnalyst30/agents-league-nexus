import pytest

@pytest.mark.asyncio
async def test_game_state():
    from src.game.state import GameState, Character

    state = GameState(
        campaign_id="test",
        campaign_name="Test",
        current_location="start",
    )

    char = Character(
        agent_id="hero",
        name="Hero",
        role="Adventurer",
        health=20, max_health=20,
        stamina=10, max_stamina=10,
    )
    state.party["hero"] = char

    summary = state.get_party_summary()
    assert "Hero" in summary
    assert "HP: 20/20" in summary

    state.add_to_log("Test entry")
    assert len(state.session_log) == 1
