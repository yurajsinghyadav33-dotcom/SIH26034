import type {
  NormalizedCommodityExtraction,
  RuleValidationResult,
  ComplianceEvaluationReport,
  OverallComplianceStatus,
} from '@sih/shared';
import { RuleCatalog } from './RuleCatalog.js';

export class RuleEngine {
  public static readonly VERSION = '2011.1';

  /**
   * Deterministically validates normalized commodity extraction data
   * against authoritative Legal Metrology rules.
   */
  public evaluate(extraction: NormalizedCommodityExtraction): ComplianceEvaluationReport {
    const allRegisteredRules = RuleCatalog.getAllRules();
    const ruleResults: RuleValidationResult[] = [];

    let passedCount = 0;
    let failedCount = 0;
    let uncertainCount = 0;
    let notDetectedCount = 0;
    let notApplicableCount = 0;

    for (const rule of allRegisteredRules) {
      // 1. Check legal applicability for this commodity
      const applicabilityCheck = rule.isApplicable(extraction);

      if (!applicabilityCheck.applicable) {
        notApplicableCount++;
        ruleResults.push({
          ruleId: rule.ruleId,
          ruleReference: rule.ruleReference,
          title: rule.title,
          requirement: 'Statutory applicability condition not met for this commodity classification or packaging date.',
          applicable: false,
          applicabilityReason: applicabilityCheck.reason,
          status: 'NOT_APPLICABLE',
          severity: rule.severity,
          reason: applicabilityCheck.reason,
          evidence: {
            actualObserved: 'Not applicable per statutory exemptions/provisos.',
          },
          statutoryReference: rule.statutoryReference,
        });
        continue;
      }

      // 2. Deterministically validate the rule
      const validationResult = rule.validate(extraction);
      validationResult.applicable = true;
      validationResult.applicabilityReason = applicabilityCheck.reason;
      ruleResults.push(validationResult);

      // 3. Tally results
      switch (validationResult.status) {
        case 'PASS':
          passedCount++;
          break;
        case 'FAIL':
          failedCount++;
          break;
        case 'UNCERTAIN':
          uncertainCount++;
          break;
        case 'NOT_DETECTED':
          notDetectedCount++;
          break;
        case 'NOT_APPLICABLE':
          notApplicableCount++;
          break;
      }
    }

    const totalApplicable = passedCount + failedCount + uncertainCount + notDetectedCount;
    const criticalViolations = ruleResults.filter(
      (r) => r.status === 'FAIL' && r.severity === 'CRITICAL'
    );

    // 4. Determine overall compliance status without false conflation
    let overallStatus: OverallComplianceStatus;
    let summaryExplanation: string;

    if (failedCount > 0) {
      overallStatus = 'NON_COMPLIANT';
      summaryExplanation = `Statutory non-compliance: Detected ${failedCount} affirmative rule violation(s) (${criticalViolations.length} critical) under Legal Metrology Rules, 2011.`;
    } else if (uncertainCount > 0) {
      overallStatus = 'FLAGGED_FOR_REVIEW';
      summaryExplanation = `Flagged for physical verification: ${uncertainCount} declaration(s) are ambiguous or require officer confirmation. Not automatically marked as non-compliant.`;
    } else if (notDetectedCount > 0) {
      overallStatus = 'INCOMPLETE_DATA';
      summaryExplanation = `Incomplete label scan: ${notDetectedCount} statutory declaration(s) were not detected on scanned panel(s). Physical verification required before notice issuance.`;
    } else {
      overallStatus = 'COMPLIANT';
      summaryExplanation = `Full compliance verified: All ${totalApplicable} applicable Legal Metrology statutory declarations conform to Rules 2011 and amendments.`;
    }

    return {
      overallStatus,
      ruleVersion: RuleEngine.VERSION,
      evaluatedAt: new Date().toISOString(),
      totalApplicableRules: totalApplicable,
      passedCount,
      failedCount,
      uncertainCount,
      notDetectedCount,
      notApplicableCount,
      ruleResults,
      criticalViolations,
      summaryExplanation,
    };
  }
}

export const ruleEngine = new RuleEngine();
