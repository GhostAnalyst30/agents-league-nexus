def validate_player_action(action: str) -> str:
    if not action or not action.strip():
        raise ValueError("Action cannot be empty")
    if len(action) > 500:
        raise ValueError("Action too long (max 500 characters)")
    return action.strip()

def validate_check_type(check_type: str) -> str:
    valid_types = {
        "strength", "dexterity", "constitution",
        "intelligence", "wisdom", "charisma",
    }
    if check_type.lower() not in valid_types:
        raise ValueError(
            f"Invalid check type: {check_type}. "
            f"Valid: {', '.join(sorted(valid_types))}"
        )
    return check_type.lower()
