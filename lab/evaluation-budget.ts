import { validateLedger, type CloudLedger } from '../electron/jev.ts'

// User approved a $3 CUMULATIVE reservation ceiling on 2026-10-29.
export const MAX_EVALUATION_CAP_USD = 3
export type EvaluationBudget = { capUsd: number; priorUsage: unknown; current: CloudLedger; authorizationHistory?: unknown[] }
export function validateEvaluationBudget(value: unknown): EvaluationBudget {
  const budget = value as EvaluationBudget
  if (!budget || !Number.isFinite(budget.capUsd) || budget.capUsd <= 0 || budget.capUsd > MAX_EVALUATION_CAP_USD || !budget.priorUsage) throw new Error('Unrecognized evaluation allowance; retain prior usage and stay within the authorized cumulative cap.')
  validateLedger(budget.current)
  if (budget.current.reservedUsd > budget.capUsd) throw new Error('Evaluation history exceeds its allowance; do not reset it.')
  return budget
}
