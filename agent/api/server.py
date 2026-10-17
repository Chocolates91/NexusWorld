"""Dependency-free local HTTP server for Nexus World."""

from __future__ import annotations

import argparse
import json
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any

from agent.providers import MockProvider


class NexusRequestHandler(BaseHTTPRequestHandler):
    provider = MockProvider()

    def _send_json(self, status: HTTPStatus, payload: dict[str, Any]) -> None:
        encoded = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def _read_json(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0"))
        if length == 0:
            return {}
        value = json.loads(self.rfile.read(length).decode("utf-8"))
        if not isinstance(value, dict):
            raise ValueError("The JSON body must be an object")
        return value

    def do_GET(self) -> None:  # noqa: N802 - required by BaseHTTPRequestHandler
        if self.path == "/health":
            self._send_json(
                HTTPStatus.OK,
                {"status": "ok", "service": "nexus-agent", "provider": self.provider.name},
            )
            return
        self._send_json(HTTPStatus.NOT_FOUND, {"error": "not_found"})

    def do_POST(self) -> None:  # noqa: N802 - required by BaseHTTPRequestHandler
        try:
            payload = self._read_json()
            if self.path == "/decide":
                self._send_json(HTTPStatus.OK, self.provider.decide(payload.get("observation")))
                return
            if self.path == "/message":
                message = payload.get("message")
                if not isinstance(message, str) or not message.strip():
                    self._send_json(HTTPStatus.BAD_REQUEST, {"error": "message_required"})
                    return
                self._send_json(HTTPStatus.OK, {"reply": self.provider.reply(message)})
                return
            self._send_json(HTTPStatus.NOT_FOUND, {"error": "not_found"})
        except (json.JSONDecodeError, UnicodeDecodeError, ValueError):
            self._send_json(HTTPStatus.BAD_REQUEST, {"error": "invalid_json"})

    def log_message(self, format: str, *args: object) -> None:
        print(f"[nexus-agent] {format % args}")


class NexusServer(ThreadingHTTPServer):
    allow_reuse_address = True
    daemon_threads = True


def create_server(host: str = "127.0.0.1", port: int = 8765) -> NexusServer:
    return NexusServer((host, port), NexusRequestHandler)


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the Nexus World agent API")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", default=8765, type=int)
    args = parser.parse_args()
    server = create_server(args.host, args.port)
    print(f"Nexus agent listening on http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

