import logging
import sys

class AgentLogger:
    def __init__(self, name: str = "reasoning-rpg"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.INFO)
        if not self.logger.handlers:
            handler = logging.StreamHandler(sys.stdout)
            handler.setFormatter(
                logging.Formatter(
                    "[%(asctime)s] %(levelname)s - %(message)s",
                    datefmt="%Y-%m-%d %H:%M:%S",
                )
            )
            self.logger.addHandler(handler)

    def info(self, message: str, extra: dict | None = None):
        self.logger.info(message, extra=extra or {})

    def error(self, message: str, extra: dict | None = None):
        self.logger.error(message, extra=extra or {})

    def debug(self, message: str, extra: dict | None = None):
        self.logger.debug(message, extra=extra or {})
