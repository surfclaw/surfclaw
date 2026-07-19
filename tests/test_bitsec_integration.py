import unittest
import surfclaw_core
from surfclaw_core import PyBitsecBridge, PySapParser

class TestBitsecIntegration(unittest.TestCase):
    def test_bitsec_bridge(self):
        print("\n[TEST] Initializing PyBitsecBridge...")
        bridge = PyBitsecBridge("https://api.bitsec.ai/v1/telemetry", "test_miner_hotkey_99")
        session_id = bridge.report_audit_telemetry(
            code_size_bytes=5240,
            vulns_count=4,
            max_severity="HIGH",
            exec_time_ms=280
        )
        print(f"[TEST] Telemetry Sent Successfully. Session ID: {session_id}")
        self.assertTrue(session_id.startswith("AUDIT-"))

    def test_sap_parser_sloppy_json(self):
        print("\n[TEST] Feeding broken JSON to PySapParser...")
        broken_vulnerability_json = """
        {
            "prediction": true,
            "vulnerabilities": [
                {
                    "severity": "HIGH",
                    "description": "SQL Injection in query endpoint",
                    "vulnerable_code": "db.execute(f'SELECT * FROM users WHERE id = {user_input}')",
                }
            ],
        }
        """
        fixed_str = PySapParser.parse_json(broken_vulnerability_json)
        print(f"[TEST] Repaired JSON from Rust Parser: {fixed_str}")
        
        PySapParser.assert_field(fixed_str, "prediction", "boolean")
        PySapParser.assert_field(fixed_str, "vulnerabilities", "array")
        print("[TEST] BAML Asset Type Assertions: PASSED")

if __name__ == "__main__":
    unittest.main()
