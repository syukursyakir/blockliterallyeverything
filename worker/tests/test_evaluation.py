import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import unittest

LAB=Path(__file__).resolve().parents[2]/"lab"
sys.path.insert(0,str(LAB))
from scoring import metrics
from jev import reserve,MAX_CALLS

class EvaluationTests(unittest.TestCase):
    def test_absent_positive_coverage_is_not_perfect_recall(self):
        result=metrics([{'expected':False,'predicted':False}])
        self.assertIsNone(result['positive_detection_rate'])
        self.assertEqual(result['negatives'],1)

    def test_unknowns_are_visible_and_conservative_policy_can_false_block(self):
        rows=[{'expected':True,'predicted':None},{'expected':False,'predicted':None},{'expected':None,'predicted':True}]
        raw=metrics(rows);strict=metrics(rows,True)
        self.assertEqual(raw['unknown'],2)
        self.assertEqual(raw['positive_detection_rate'],0)
        self.assertEqual(strict['positive_detection_rate'],1)
        self.assertEqual(strict['false_block_rate'],1)
        self.assertEqual(raw['ambiguous_cases'],1)

    def test_budget_is_persistent_and_stops_before_another_reservation(self):
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'budget.json'
            for _ in range(MAX_CALLS):reserve(path)
            state=json.loads(path.read_text())
            self.assertLess(state['reserved_usd'],3)
            self.assertEqual(state['calls'],MAX_CALLS)
            with self.assertRaises(RuntimeError):reserve(path)
            self.assertEqual(json.loads(path.read_text()),state)

    def test_choice_rejects_malformed_probabilities(self):
        from scoring import classify_choice
        for answer in [{}, {'choice':'allow','probabilities':{'block':float('nan'),'allow':0,'unknown':0}}]:
            with self.assertRaises(ValueError):classify_choice(answer)

    def test_choice_abstention_and_invalid_are_unknown(self):
        from scoring import classify_choice
        answer={'choice':'allow','probabilities':{'block':0.1,'allow':0.2,'unknown':0.1},'abstain':0.6}
        self.assertEqual(classify_choice(answer),(None,'upstream-abstain'))
        answer.update(valid=False)
        self.assertEqual(classify_choice(answer),(None,'invalid-normalization'))
        answer={'choice':'unknown','probabilities':{'block':0.1,'allow':0.1,'unknown':0.8}}
        self.assertEqual(classify_choice(answer),(None,'explicit-unknown'))

    def test_fingerprint_requires_executed_rows_and_detects_partial_run(self):
        from corpus import executed_fingerprint
        def report(selected):
            return {'corpus':{'cases':[{'id':key,'sha256':key,'labels':{'video':True}} for key in ['a','b']]},
                    'selected_case_ids':selected,'prepared_sha256':{'a':'a','b':'b'},
                    'formats':{'noul':{'rows':[{'case':key,'rule':'video','expected':True} for key in selected]}}}
        self.assertNotEqual(executed_fingerprint(report(['a'])),executed_fingerprint(report(['a','b'])))
        broken=report(['a','b']);broken['formats']['noul']['rows'].pop()
        with self.assertRaises(ValueError):executed_fingerprint(broken)

    def test_source_checksum_is_verified(self):
        from corpus import verify_case
        with tempfile.TemporaryDirectory() as directory:
            path=Path(directory)/'image';path.write_bytes(b'changed')
            with self.assertRaises(ValueError):verify_case(path,{'id':'test','sha256':'wrong'})
