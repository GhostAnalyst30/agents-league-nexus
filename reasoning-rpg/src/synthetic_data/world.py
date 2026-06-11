"""Synthetic world data for the RPG campaign.
ALL content is original and fictional. No copyrighted material."""

WORLD_OVERVIEW = """# The Shattered Moon of Eldervale

## World Overview
Eldervale is a fantasy realm where the moon shattered centuries ago,
scattering magical fragments across the land. The fragments, called
"Starfall Shards," are the source of all magic. Kingdoms rose and fell
as factions fought for control of these shards.

## Geography
- Northern Eldervale: Frozen tundra, ancient ruins, dragon territories
- The Verdant Reach: Lush forests, elven enclaves, hidden groves
- The Sunken Coast: Trading ports, pirate dens, sunken temples
- The Ashen Wastes: Desert, volcanic region, forgotten civilizations
- The Skyborn Peaks: Mountain ranges, monastic orders, cloud cities

## Laws of Magic
- Magic flows from Starfall Shards
- Only those attuned to a shard can cast spells
- Shards can be corrupted by dark emotions
- Magic is strongest under moonlight
- Using too much magic attracts "The Hollow" (void creatures)

## Calendar
- Year: 842 AS (After Shattering)
- Season: Deepautumn
- Festival: MoonReap (harvest festival, 3 days)
"""

LOCATIONS = [
    {
        "id": "moonlit_gate",
        "name": "The Moonlit Gate",
        "type": "Ancient ruin",
        "region": "Northern Eldervale",
        "description": "A silver stone archway buried in a ruined chapel. "
                       "It opens only under moonlight when three conflicting "
                       "truths are spoken by three different travelers. "
                       "The air hums with ancient magic.",
        "exits": {"north": "frostwood_forest", "south": "silverbrook_village"},
        "items": ["rusted_key", "old_journal_page"],
        "secrets": [
            "The gate opens to a memory of the kingdom before the moon shattered",
            "Opening without the Starwell Relic summons a guardian"
        ],
        "encounters": [
            {"enemy_ids": ["hollow_guardian"], "description": "A Hollow Guardian emerges from the shadows of the gate!"}
        ],
    },
    {
        "id": "silverbrook_village",
        "name": "Silverbrook Village",
        "type": "Settlement",
        "region": "Northern Eldervale",
        "description": "A small logging village at the edge of the Frostwood. "
                       "Friendly locals, a tavern called The Splintered Antler, "
                       "and a temple of the Silver Root. Smoke rises from chimneys "
                       "and the smell of fresh bread fills the air.",
        "exits": {"north": "moonlit_gate", "east": "frostwood_forest"},
        "npcs": ["Elder Maren", "Brom the Blacksmith", "Sister Lys"],
        "items": ["healing_potion", "trail_rations"],
        "encounters": [],
    },
    {
        "id": "frostwood_forest",
        "name": "Frostwood Forest",
        "type": "Forest",
        "region": "Northern Eldervale",
        "description": "A dense pine forest where the trees grow in twisted "
                       "patterns. Strange lights dance between the trunks. "
                       "Rumors speak of a hidden glade with a Starfall Shard. "
                       "The howling of wolves echoes in the distance.",
        "exits": {"south": "silverbrook_village", "west": "moonlit_gate"},
        "npcs": ["Wandering Merchant"],
        "items": ["silver_herb", "ancient_coin", "healing_potion"],
        "secrets": ["A hidden grove contains a minor Starfall Shard"],
        "encounters": [
            {"enemy_ids": ["frostwolf"], "description": "A pack of Frostwolves emerges from the undergrowth!"},
            {"enemy_ids": ["frostwolf", "frostwolf"], "description": "Two Frostwolves block the path ahead!"},
        ],
    },
]

FACTIONS = [
    {
        "id": "order_silver_root",
        "name": "Order of the Silver Root",
        "type": "Religious order",
        "goals": ["Preserve ancient knowledge", "Heal the land"],
        "leader": "High Mother Corina",
        "headquarters": "Silverbrook Temple",
        "allies": ["Silverbrook Village"],
        "enemies": ["The Hollow Cult"],
        "secrets": [
            "They know the true purpose of the Moonlit Gate",
            "They possess a map to three Starfall Shards",
        ],
    },
    {
        "id": "hollow_cult",
        "name": "The Hollow Cult",
        "type": "Secret cult",
        "goals": ["Collect all Starfall Shards", "Open the Void"],
        "leader": "Unknown (called 'The Whisper')",
        "headquarters": "Hidden temple in the Ashen Wastes",
        "enemies": ["Order of the Silver Root", "All kingdoms"],
        "secrets": [
            "Led by a formerly respected mage who went mad",
            "Can track Starfall Shard locations",
        ],
    },
]

CHARACTERS = [
    {
        "id": "warrior",
        "name": "Bran Ironvale",
        "role": "Warrior",
        "health": 25,
        "abilities": {"strength": 5, "dexterity": 2, "constitution": 4},
        "backstory": (
            "Ex-soldier of the Northern Guard. Lost his family shield "
            "during a Hollow Cult raid. Sworn to recover it."
        ),
        "personality": "Brave, direct, protective, suspicious of magic",
        "inventory": ["longsword", "shield", "torch", "trail_rations"],
    },
    {
        "id": "mage",
        "name": "Lyra Vey",
        "role": "Mage",
        "health": 14,
        "abilities": {"intelligence": 5, "wisdom": 3, "charisma": 2},
        "backstory": (
            "Apprentice of the Arcane Academy. Believes the myth of the "
            "Starwell is real and seeks to prove it."
        ),
        "personality": "Curious, analytical, slightly arrogant",
        "inventory": ["spellbook", "crystal_focus", "scroll_of_light"],
    },
    {
        "id": "rogue",
        "name": "Kira Swiftfoot",
        "role": "Rogue",
        "health": 16,
        "abilities": {"dexterity": 5, "charisma": 3, "intelligence": 2},
        "backstory": (
            "Former thieves' guild operative. Has contacts in every major "
            "city. Seeking a way to clear her debt to the guild."
        ),
        "personality": "Witty, skeptical, opportunistic",
        "inventory": ["lockpicks", "smoke_bomb", "short_sword"],
    },
    {
        "id": "healer",
        "name": "Sister Elara",
        "role": "Healer",
        "health": 18,
        "abilities": {"wisdom": 5, "charisma": 3, "constitution": 2},
        "backstory": (
            "Novice of the Silver Root order. Believes the cursed Frostwood "
            "can be healed rather than destroyed."
        ),
        "personality": "Compassionate, observant, principled",
        "inventory": ["healing_staff", "herbs", "holy_symbol"],
    },
    {
        "id": "rival",
        "name": "Kael Thorn",
        "role": "Rival",
        "health": 20,
        "abilities": {"charisma": 4, "intelligence": 3, "dexterity": 3},
        "backstory": (
            "Wealthy relic hunter. Knows more about the ancient ruins "
            "than he admits. Seeks the Starwell Relic for his own purposes."
        ),
        "personality": "Charismatic, proud, unpredictable",
        "inventory": ["fine_sword", "compass", "old_map"],
    },
]

QUESTS = [
    {
        "id": "starwell_relic",
        "name": "Find the Starwell Relic",
        "description": "A legendary artifact hidden in the Moonlit Gate. "
                       "Required to restore the shattered moon.",
        "objectives": [
            "Enter the Moonlit Gate",
            "Find the three conflicting truths",
            "Claim the Starwell Relic",
            "Defeat the guardian",
        ],
        "clues": [
            "The gate symbol matches an eye-shaped sigil",
            "The Healer's order knows about the gate",
            "The Rival claims the gate leads to a vault",
        ],
    },
]

ITEMS = [
    {
        "id": "starwell_relic",
        "name": "Starwell Relic",
        "type": "Artifact",
        "description": "A pulsing crystal shard that hums with ancient power. "
                       "Key to restoring the shattered moon.",
    },
    {
        "id": "healing_potion",
        "name": "Healing Potion",
        "type": "Consumable",
        "effect": "Restores 2d4+2 health",
    },
]

BESTIARY = [
    {
        "id": "hollow_guardian",
        "name": "Hollow Guardian",
        "type": "Construct",
        "health": 30,
        "abilities": {"strength": 4, "dexterity": 1, "constitution": 5},
        "weaknesses": ["Radiant damage", "Silver weapons"],
        "behavior": "Defends the Moonlit Gate. Attacks intruders on sight.",
        "loot": ["starwell_shard", "ancient_coin"],
    },
    {
        "id": "frostwolf",
        "name": "Frostwolf",
        "type": "Beast",
        "health": 15,
        "abilities": {"strength": 2, "dexterity": 4, "constitution": 2},
        "weaknesses": ["Fire damage"],
        "behavior": "Hunts in packs. Attacks the weakest target first.",
        "loot": ["wolf_pelt", "raw_meat"],
    },
    {
        "id": "bandit",
        "name": "Bandit",
        "type": "Humanoid",
        "health": 12,
        "abilities": {"strength": 2, "dexterity": 3, "constitution": 2},
        "weaknesses": [],
        "behavior": "Demands gold. Fights until half health then flees.",
        "loot": ["gold_coins", "short_sword"],
    },
    {
        "id": "void_cultist",
        "name": "Void Cultist",
        "type": "Humanoid",
        "health": 18,
        "abilities": {"strength": 1, "dexterity": 2, "constitution": 3, "intelligence": 3},
        "weaknesses": ["Radiant damage"],
        "behavior": "Channels void energy. Prefers to attack from range.",
        "loot": ["void_shard", "cult_robes"],
    },
]

HOMEBREW_RULES = """# Homebrew Rules (Lightweight RPG)

## Ability Checks
- Roll 1d20 + ability modifier
- Target number set by Game Master (10=easy, 15=medium, 20=hard)
- Critical success on natural 20, critical failure on natural 1

## Combat
- Initiative: 1d20 + dexterity modifier
- Attack: 1d20 + strength/dexterity modifier vs DC 10 + target dexterity
- Damage: weapon die + strength modifier
- Health: 0 HP = unconscious, -max HP = dead

## Rest
- Short rest (1 hour): recover 1d8 + constitution HP
- Long rest (8 hours): full recovery, restore stamina

## Inventory
- Characters can carry 10 items (plus equipped gear)
- Consumables stack up to 5

## Leveling
- After 3 quests completed: +2 to one ability, +1d8 max health
"""
