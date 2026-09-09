/**
 * SIH26034 - Legal Metrology Rule Engine Data Contracts
 * Pure, deterministic rule validation models
 */

import type { ViolationSeverity } from './index.js';
import type { BoundingBox } from './database.js';
import type { NormalizedCommodityExtraction } from './normalizedExtraction.js';

export type RuleValidationStatus =
  | 'PASS'
  | 'FAIL'
  | 'NOT_APPLICABLE'
  | 'UNCERTAIN'
  | 'NOT_DETECTED';

export type OverallComplianceStatus =
  | 'COMPLIANT'
  | 'NON_COMPLIANT'
  | 'FLAGGED_FOR_REVIEW'
  | 'INCOMPLETE_DATA';

export interface RuleValidationEvidence {
  declarationKey?: string;
  detectedText?: string | null;
  expectedRequirement?: string;
  actualObserved?: string;
  confidence?: number | null;
  boundingBox?: BoundingBox;
}

export interface RuleValidationResult {
  ruleId: string;
  ruleReference: string;
  title: string;
  requirement: string;
  applicable: boolean;
  applicabilityReason: string;
  status: RuleValidationStatus;
  severity: ViolationSeverity;
  reason: string;
  evidence: RuleValidationEvidence;
  suggestedRemedy?: string;
  statutoryReference: string;
}

export interface IComplianceRule {
  ruleId: string;
  ruleReference: string; // e.g. "Rule 6(1)(e)"
  title: string;
  statutoryReference: string;
  sourceDocument: string;
  effectiveFrom?: string; // YYYY-MM-DD
  effectiveTo?: string | null;
  severity: ViolationSeverity;
  
  /**
   * Evaluates whether the rule is legally applicable to the commodity.
   */
  isApplicable(extraction: NormalizedCommodityExtraction): {
    applicable: boolean;
    reason: string;
  };

  /**
   * Deterministically validates the extracted data against the statutory requirement.
   */
  validate(extraction: NormalizedCommodityExtraction): RuleValidationResult;
}

export interface ComplianceEvaluationReport {
  overallStatus: OverallComplianceStatus;
  ruleVersion: string;
  evaluatedAt: string;
  totalApplicableRules: number;
  passedCount: number;
  failedCount: number;
  uncertainCount: number;
  notDetectedCount: number;
  notApplicableCount: number;
  ruleResults: RuleValidationResult[];
  criticalViolations: RuleValidationResult[];
  summaryExplanation: string;
}
