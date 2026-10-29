import math
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from policy import failure_message, questions_for, validate_rules, verdicts_for

class PolicyTests(unittest.TestCase):
    def setUp(self):
        self.rules = [{"id": "explicit", "instruction": "Block explicit nudity"}]

    def test_independent_typed_question_preserves_rule(self):
        question = questions_for(self.rules)["explicit"]
        self.assertEqual(question["type"], "noul")
        self.assertIn(self.rules[0]["instruction"], question["instructions"])
        self.assertIn("untrusted", question["instructions"])

    def test_missing_invalid_scores_never_mean_allowed(self):
        for value in [None, True, math.nan, math.inf, -0.1, 1.1, "safe"]:
            with self.subTest(value=value), self.assertRaises(ValueError):
                verdicts_for({"explicit": {"noul": value}}, self.rules)
        with self.assertRaises(ValueError):
            verdicts_for({}, self.rules)

    def test_duplicate_and_empty_rules_rejected(self):
        for rules in [[], self.rules * 2, [{"id": "x", "instruction": " "}]]:
            with self.assertRaises(ValueError):
                validate_rules(rules)

    def test_valid_probabilities_are_preserved(self):
        self.assertEqual(verdicts_for({"explicit": {"noul": 0.72}}, self.rules), [{"ruleId": "explicit", "probability": 0.72}])

    def test_download_errors_offer_recovery_without_echoing_sensitive_details(self):
        class ProxyError(Exception):
            pass
        message = failure_message(ProxyError("https://user:PRIVATE@proxy/image.png"), "install")
        self.assertIn("Hugging Face", message)
        self.assertNotIn("PRIVATE", message)
        self.assertNotIn("image.png", message)

    def test_disk_and_load_errors_are_distinct(self):
        import errno
        self.assertIn("disk space", failure_message(OSError(errno.ENOSPC, "private path"), "install"))
        self.assertIn("could not load", failure_message(RuntimeError("private path"), "load"))
