import json
import os
from typing import Dict, Any, List, Optional
from ..utils.llm import LLMProvider

class FoundryIQ:
    def __init__(self, llm_provider: LLMProvider):
        self.llm = llm_provider
        self.knowledge_base: Dict[str, str] = {}
        self._load_knowledge_base()

    def _load_knowledge_base(self):
        kb_dir = os.path.join(
            os.path.dirname(__file__), "..", "synthetic_data"
        )
        if not os.path.exists(kb_dir):
            return

        for filename in os.listdir(kb_dir):
            if filename.endswith((".md", ".txt", ".json")):
                filepath = os.path.join(kb_dir, filename)
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                key = filename.replace(".md", "").replace(".txt", "")
                self.knowledge_base[key] = content

    def query(self, topic: str) -> Optional[str]:
        topic_lower = topic.lower()
        for key, content in self.knowledge_base.items():
            if topic_lower in key.lower() or topic_lower in content.lower():
                return content
        return None

    async def retrieve_lore(
        self, query: str, context: Dict[str, Any]
    ) -> str:
        kb_result = self.query(query)

        if kb_result:
            return kb_result

        system_prompt = (
            "Eres un motor de conocimiento de mundo para un juego RPG. "
            "Debes responder SOLO con informacion que exista en el contexto "
            "proporcionado. Si no sabes algo, di 'No tengo informacion sobre eso'."
        )
        context_str = json.dumps(context, indent=2)
        user_prompt = (
            f"Consulta: {query}\n\n"
            f"Conocimiento disponible:\n{context_str}"
        )

        response = await self.llm.chat(
            system_prompt=system_prompt,
            user_message=user_prompt,
            temperature=0.3,
        )
        return response
