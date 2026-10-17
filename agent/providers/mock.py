"""Deterministic provider used while no language model is connected."""

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class MockProvider:
    """Return predictable actions so the game integration can be tested."""

    name: str = "mock"

    def decide(self, observation: dict[str, Any] | None = None) -> dict[str, Any]:
        observation = observation or {}
        return {
            "action": "wait",
            "parameters": {"seconds": 1},
            "reason": "Deterministic mock decision",
            "observation_received": bool(observation),
        }

    def reply(self, message: str) -> str:
        return f"He recibido: {message.strip()}"

