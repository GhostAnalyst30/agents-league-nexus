import os
import json
from dataclasses import asdict
from typing import Optional
from .state import GameState


SAVE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")


class SaveManager:
    @staticmethod
    def ensure_save_dir():
        if not os.path.exists(SAVE_DIR):
            os.makedirs(SAVE_DIR)

    @staticmethod
    def save(state: GameState, slot: str = "autosave") -> dict:
        SaveManager.ensure_save_dir()
        filepath = os.path.join(SAVE_DIR, f"{slot}.json")
        data = state.to_dict()
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return {"success": True, "slot": slot, "path": filepath}

    @staticmethod
    def load(slot: str = "autosave") -> Optional[dict]:
        filepath = os.path.join(SAVE_DIR, f"{slot}.json")
        if not os.path.exists(filepath):
            return None
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)

    @staticmethod
    def list_saves() -> list:
        SaveManager.ensure_save_dir()
        saves = []
        for fname in os.listdir(SAVE_DIR):
            if fname.endswith(".json"):
                filepath = os.path.join(SAVE_DIR, fname)
                mtime = os.path.getmtime(filepath)
                slot = fname.replace(".json", "")
                saves.append({"slot": slot, "modified": mtime, "path": filepath})
        return saves

    @staticmethod
    def delete(slot: str) -> bool:
        filepath = os.path.join(SAVE_DIR, f"{slot}.json")
        if os.path.exists(filepath):
            os.remove(filepath)
            return True
        return False
