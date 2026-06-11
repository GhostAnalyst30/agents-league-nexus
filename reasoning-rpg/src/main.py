import os
from typing import Dict, Any, List, AsyncGenerator, Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from .config import Settings
from .utils.llm import get_llm_provider
from .utils.logging import AgentLogger
from .iq_layers.foundry_iq import FoundryIQ
from .game.state import GameState, Character, Quest, Location, CombatEnemy
from .game.rules import DiceRoller
from .game.quests import QuestManager
from .game.combat import CombatManager
from .game.navigation import NavigationManager
from .game.inventory import InventoryManager
from .game.persistence import SaveManager
from .agents.game_master import GameMasterAgent
from .agents.warrior import WarriorAgent
from .agents.mage import MageAgent
from .agents.rogue import RogueAgent
from .agents.healer import HealerAgent
from .agents.rival import RivalAgent
from .synthetic_data.world import (
    WORLD_OVERVIEW, LOCATIONS, CHARACTERS, FACTIONS,
    QUESTS, ITEMS, BESTIARY, HOMEBREW_RULES,
)

load_dotenv()
settings = Settings()

game_state: GameState = None
agents: Dict[str, Any] = {}
logger = AgentLogger()


class PlayerAction(BaseModel):
    action: str
    campaign_id: str = "default"


class RollRequest(BaseModel):
    character_id: str
    check_type: str
    difficulty: int = 15


class MoveRequest(BaseModel):
    direction: str


class UseItemRequest(BaseModel):
    character_id: str
    item_name: str
    target_id: Optional[str] = None


class PickupItemRequest(BaseModel):
    character_id: str
    item: str


class CombatActionRequest(BaseModel):
    action: str
    target_id: Optional[str] = None


class RestRequest(BaseModel):
    is_long_rest: bool = False


class SaveRequest(BaseModel):
    slot: str = "autosave"


class TalkRequest(BaseModel):
    npc_name: str


def _init_game() -> GameState:
    llm = None
    try:
        llm = get_llm_provider()
    except ValueError:
        logger.info("No LLM provider configured - game will run without AI narration")

    if llm:
        foundry_iq = FoundryIQ(llm)
        agents["gm"] = GameMasterAgent(llm, foundry_iq)
        agents["warrior"] = WarriorAgent(llm)
        agents["mage"] = MageAgent(llm)
        agents["rogue"] = RogueAgent(llm)
        agents["healer"] = HealerAgent(llm)
        agents["rival"] = RivalAgent(llm)

    party = {}
    for char_data in CHARACTERS:
        char = Character(
            agent_id=char_data["id"],
            name=char_data["name"],
            role=char_data["role"],
            health=char_data["health"],
            max_health=char_data["health"],
            stamina=10,
            max_stamina=10,
            inventory=char_data.get("inventory", []),
            abilities=char_data["abilities"],
            backstory=char_data["backstory"],
            personality=char_data["personality"],
        )
        party[char_data["id"]] = char

    locations = {}
    for loc_data in LOCATIONS:
        loc_data_copy = loc_data.copy()
        loc_data_copy.setdefault("encounters", [])
        loc = Location(**loc_data_copy)
        locations[loc_data["id"]] = loc

    quests = {}
    for quest_data in QUESTS:
        q = Quest(
            id=quest_data["id"],
            name=quest_data["name"],
            description=quest_data["description"],
            status=quest_data.get("status", "active"),
            objectives=list(quest_data.get("objectives", [])),
            original_objectives=list(quest_data.get("objectives", [])),
            clues=list(quest_data.get("clues", [])),
            rewards=list(quest_data.get("rewards", [])),
        )
        quests[quest_data["id"]] = q

    gs = GameState(
        campaign_id="default",
        campaign_name="The Shattered Moon of Eldervale",
        current_location="silverbrook_village",
        party=party,
        locations=locations,
        quests=quests,
        world_flags={"rival_trust_level": "uncertain"},
    )

    logger.info("Game initialized", extra={"state": gs.campaign_name})
    return gs


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    global game_state
    game_state = _init_game()
    yield
    game_state = None


app = FastAPI(
    title="Reasoning RPG - Agent Game System",
    description="Multi-agent fantasy RPG system with full game mechanics",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "game": "Reasoning RPG",
        "campaign": game_state.campaign_name if game_state else "Not initialized",
        "status": "ready" if game_state else "starting",
        "phase": "exploration" if game_state and game_state.is_exploration_phase() else "combat" if game_state and game_state.is_combat_phase() else "game_over",
    }


@app.get("/api/state")
async def get_state():
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    return game_state.to_dict()


@app.get("/api/summary")
async def get_summary():
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    loc = game_state.get_current_location_obj()
    return {
        "campaign": game_state.campaign_name,
        "location": {
            "id": game_state.current_location,
            "name": loc.name if loc else "Unknown",
            "description": loc.description[:200] if loc else "",
        },
        "party": {
            pid: {
                "name": c.name,
                "role": c.role,
                "health": c.health,
                "max_health": c.max_health,
                "stamina": c.stamina,
                "max_stamina": c.max_stamina,
                "level": c.level,
                "experience": c.experience,
            }
            for pid, c in game_state.party.items()
        },
        "turn": game_state.turn_count,
        "phase": "exploration" if game_state.is_exploration_phase() else "combat" if game_state.is_combat_phase() else "game_over",
        "in_combat": game_state.combat.active,
    }


# === EXPLORATION ENDPOINTS ===

@app.get("/api/location")
async def get_location():
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    return NavigationManager.get_location_info(game_state)


@app.post("/api/move")
async def move(req: MoveRequest):
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    if game_state.is_combat_phase():
        raise HTTPException(400, "Cannot move during combat")

    result = NavigationManager.move(game_state, req.direction.lower())
    if "error" in result:
        raise HTTPException(400, result["error"])

    quest_updates = QuestManager.check_auto_progress(game_state)
    if quest_updates:
        result["quest_updates"] = quest_updates

    return result


@app.post("/api/search")
async def search_location():
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    result = NavigationManager.search_location(game_state)
    return result


@app.post("/api/talk")
async def talk_to_npc(req: TalkRequest):
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    result = NavigationManager.talk_to_npc(game_state, req.npc_name)
    if "error" in result:
        raise HTTPException(400, result["error"])

    quest_updates = QuestManager.check_auto_progress(game_state)
    if quest_updates:
        result["quest_updates"] = quest_updates

    return result


@app.get("/api/exits")
async def get_exits():
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    return {"exits": NavigationManager.get_available_exits(game_state)}


# === COMBAT ENDPOINTS ===

@app.post("/api/combat/start")
async def start_combat(enemy_ids: List[str] = Query(...)):
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    if game_state.is_combat_phase():
        raise HTTPException(400, "Already in combat")

    result = CombatManager.start_combat(game_state, enemy_ids)
    if "error" in result:
        raise HTTPException(400, result["error"])
    return result


@app.get("/api/combat/state")
async def get_combat_state():
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    return CombatManager.get_current_turn_info(game_state)


@app.post("/api/combat/action")
async def combat_action(req: CombatActionRequest):
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    if not game_state.is_combat_phase():
        raise HTTPException(400, "Not in combat")

    result = CombatManager.execute_turn(game_state, req.action, req.target_id)
    if "error" in result:
        raise HTTPException(400, result["error"])
    return result


@app.post("/api/combat/flee")
async def flee_combat():
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    if not game_state.is_combat_phase():
        raise HTTPException(400, "Not in combat")

    success = CombatManager.flee(game_state)
    return {"fled": success}


# === INVENTORY ENDPOINTS ===

@app.post("/api/inventory/use")
async def use_item(req: UseItemRequest):
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    result = InventoryManager.use_item(game_state, req.character_id, req.item_name, req.target_id)
    if "error" in result:
        raise HTTPException(400, result["error"])
    return result


@app.post("/api/inventory/pickup")
async def pickup_item(req: PickupItemRequest):
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    if game_state.is_combat_phase():
        raise HTTPException(400, "Cannot pickup items during combat")
    result = InventoryManager.pickup_item(game_state, req.character_id, req.item)
    if "error" in result:
        raise HTTPException(400, result["error"])
    return result


@app.post("/api/inventory/drop")
async def drop_item(req: PickupItemRequest):
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    result = InventoryManager.drop_item(game_state, req.character_id, req.item)
    if "error" in result:
        raise HTTPException(400, result["error"])
    return result


# === QUEST ENDPOINTS ===

@app.get("/api/quests")
async def get_quests():
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    return {qid: {
        "id": q.id,
        "name": q.name,
        "description": q.description,
        "status": q.status,
        "objectives": q.objectives,
        "original_objectives": q.original_objectives,
        "clues": q.clues,
        "rewards": q.rewards,
    } for qid, q in game_state.quests.items()}


@app.get("/api/quests/summary")
async def quest_summary():
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    qm = QuestManager()
    return {"summary": qm.get_quest_summary()}


# === CHARACTER ENDPOINTS ===

@app.get("/api/character/{character_id}")
async def get_character(character_id: str):
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    char = game_state.party.get(character_id)
    if not char:
        raise HTTPException(404, f"Character {character_id} not found")
    return {
        "id": char.agent_id,
        "name": char.name,
        "role": char.role,
        "health": char.health,
        "max_health": char.max_health,
        "stamina": char.stamina,
        "max_stamina": char.max_stamina,
        "experience": char.experience,
        "level": char.level,
        "gold": char.gold,
        "inventory": char.inventory,
        "abilities": char.abilities,
        "conditions": char.conditions,
        "backstory": char.backstory,
    }


@app.post("/api/rest")
async def rest(req: RestRequest):
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    if game_state.is_combat_phase():
        raise HTTPException(400, "Cannot rest during combat")

    results = {}
    for cid, char in game_state.party.items():
        old_hp = char.health
        DiceRoller.rest_recovery(char, req.is_long_rest)
        recovered = char.health - old_hp
        results[cid] = {
            "name": char.name,
            "old_hp": old_hp,
            "new_hp": char.health,
            "recovered": recovered,
            "conditions_cleared": req.is_long_rest,
        }

    rest_type = "long" if req.is_long_rest else "short"
    game_state.add_to_log(f"Party took a {rest_type} rest")
    return {"rest_type": rest_type, "results": results}


# === ROLL ENDPOINT ===

@app.post("/api/roll")
async def make_roll(request: RollRequest):
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    character = game_state.party.get(request.character_id)
    if not character:
        raise HTTPException(404, f"Character {request.character_id} not found")
    result = DiceRoller.ability_check(character, request.check_type, request.difficulty)
    game_state.add_to_log(f"{character.name} rolled {request.check_type}: {result['result']}")
    return result


# === SAVE/LOAD ENDPOINTS ===

@app.post("/api/save")
async def save_game(req: SaveRequest):
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    result = SaveManager.save(game_state, req.slot)
    return result


@app.post("/api/load")
async def load_game(req: SaveRequest):
    global game_state
    data = SaveManager.load(req.slot)
    if not data:
        raise HTTPException(404, f"No save found in slot '{req.slot}'")
    game_state = GameState(
        campaign_id=data["campaign_id"],
        campaign_name=data["campaign_name"],
        current_location=data["current_location"],
        party={pid: Character(**c) for pid, c in data["party"].items()},
        locations={lid: Location(**l) for lid, l in data["locations"].items()},
        quests={qid: Quest(**q) for qid, q in data["quests"].items()},
        world_flags=data.get("world_flags", {}),
        faction_reputation=data.get("faction_reputation", {}),
        turn_count=data.get("turn_count", 0),
        session_log=data.get("session_log", []),
    )
    return {"loaded": True, "slot": req.slot, "campaign": game_state.campaign_name}


@app.get("/api/saves")
async def list_saves():
    return {"saves": SaveManager.list_saves()}


# === AI NARRATION ENDPOINT (requires API key) ===

@app.post("/api/action")
async def player_action(action: PlayerAction):
    global game_state
    if not game_state:
        raise HTTPException(500, "Game not initialized")

    gm = agents.get("gm")
    if not gm:
        return {
            "turn": game_state.turn_count,
            "gm_narrative": "AI narration not available (no API key configured). Use /api/move, /api/combat/action, etc. to play.",
            "character_responses": [],
            "party_state": game_state.get_party_summary(),
        }

    try:
        context = {
            "quest_summary": _get_quest_summary(),
            "scene": game_state.get_party_summary(),
        }

        gm_response = await gm.respond(action.action, game_state, context)
        selected_agents = gm._select_agents(action.action)
        character_responses = []

        for agent_id in selected_agents:
            if agent_id in agents and agent_id != "gm":
                agent = agents[agent_id]
                response = await agent.respond(action.action, game_state, context)
                character_responses.append({
                    "agent": agent_id,
                    "name": agent.name,
                    "response": response.narrative,
                })

        game_state.turn_count += 1
        game_state.add_to_log(f"Player: {action.action}")
        game_state.add_to_log(f"GM: {gm_response.narrative[:100]}...")

        return {
            "turn": game_state.turn_count,
            "gm_narrative": gm_response.narrative,
            "character_responses": character_responses,
            "party_state": game_state.get_party_summary(),
        }

    except Exception as e:
        logger.error(f"Action error: {e}")
        raise HTTPException(500, str(e))


# === LOCATIONS LIST ===

@app.get("/api/locations")
async def get_locations():
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    return {lid: {
        "id": l.id,
        "name": l.name,
        "description": l.description[:200],
        "type": l.type,
        "region": l.region,
        "exits": l.exits,
    } for lid, l in game_state.locations.items()}


# === BESTIARY ===

@app.get("/api/bestiary")
async def get_bestiary():
    return {"bestiary": BESTIARY}


# === ENEMIES AT CURRENT LOCATION ===

@app.get("/api/encounters")
async def get_encounters():
    if not game_state:
        raise HTTPException(500, "Game not initialized")
    loc = game_state.get_current_location_obj()
    if not loc:
        return {"encounters": []}
    return {"encounters": loc.encounters}


def _get_quest_summary() -> str:
    qm = QuestManager()
    return qm.get_quest_summary()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=True,
    )
