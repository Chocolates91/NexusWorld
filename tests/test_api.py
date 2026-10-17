import json
import threading
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from agent.api.server import create_server


class ApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.server = create_server(port=0)
        cls.port = cls.server.server_address[1]
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls) -> None:
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def request(self, path: str, payload: dict | None = None) -> tuple[int, dict]:
        data = None if payload is None else json.dumps(payload).encode("utf-8")
        request = Request(
            f"http://127.0.0.1:{self.port}{path}",
            data=data,
            headers={"Content-Type": "application/json"},
        )
        try:
            with urlopen(request, timeout=2) as response:
                return response.status, json.load(response)
        except HTTPError as error:
            return error.code, json.load(error)

    def test_health(self) -> None:
        status, body = self.request("/health")
        self.assertEqual(status, 200)
        self.assertEqual(body["provider"], "mock")

    def test_decision_is_deterministic_and_structured(self) -> None:
        status, body = self.request("/decide", {"observation": {"room": "main"}})
        self.assertEqual(status, 200)
        self.assertEqual(body["action"], "wait")
        self.assertEqual(body["parameters"], {"seconds": 1})
        self.assertTrue(body["observation_received"])

    def test_message_requires_text(self) -> None:
        status, body = self.request("/message", {"message": ""})
        self.assertEqual(status, 400)
        self.assertEqual(body["error"], "message_required")


if __name__ == "__main__":
    unittest.main()

