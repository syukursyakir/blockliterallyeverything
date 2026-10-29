"""Metrics keep unknown decisions and missing positive coverage visible."""
import math

def classify_choice(answer):
    if not isinstance(answer,dict) or 'choice' not in answer:
        raise ValueError('Missing Choice answer.')
    probabilities=answer.get('probabilities')
    if not isinstance(probabilities,dict) or set(probabilities)!={'block','allow','unknown'}:
        raise ValueError('Invalid Choice options.')
    abstain=answer.get('abstain',0)
    for value in [*probabilities.values(),abstain]:
        if isinstance(value,bool) or not isinstance(value,(int,float)) or not math.isfinite(value) or not 0<=value<=1:
            raise ValueError('Invalid Choice probability.')
    if abs(sum(probabilities.values())+abstain-1)>0.001:
        raise ValueError('Choice probabilities are not normalized.')
    chosen=answer['choice']
    if chosen not in {'block','allow','unknown',None}:
        raise ValueError('Unrecognized Choice selection.')
    if answer.get('valid',True) is not True:
        return None,'invalid-normalization'
    if chosen is None or abstain>=max(probabilities.values()):
        return None,'upstream-abstain'
    if chosen=='unknown':
        return None,'explicit-unknown'
    return chosen=='block','selected-'+chosen
def metrics(rows, conservative=False):
    result = {"labeled": 0, "positives": 0, "negatives": 0, "true_positive": 0,
              "true_negative": 0, "missed": 0, "false_block": 0, "unknown": 0, "invalid": 0, "ambiguous_cases": 0}
    for row in rows:
        truth, predicted = row["expected"], row["predicted"]
        if truth is None:
            result["ambiguous_cases"] += 1
            continue
        result["labeled"] += 1
        result["positives" if truth else "negatives"] += 1
        if predicted is None:
            result["unknown"] += 1
            if row.get('decision_reason')=='invalid-normalization':result['invalid']+=1
            if not conservative:
                continue
            predicted = True
        if truth:
            result["true_positive" if predicted else "missed"] += 1
        else:
            result["false_block" if predicted else "true_negative"] += 1
    result["positive_detection_rate"] = result["true_positive"] / result["positives"] if result["positives"] else None
    result["false_block_rate"] = result["false_block"] / result["negatives"] if result["negatives"] else None
    return result
