import type {
  IComplianceRule,
  NormalizedCommodityExtraction,
  RuleValidationResult,
} from '@sih/shared';

export const Rule6_1_b_GenericName: IComplianceRule = {
  ruleId: 'LMR_2011_R6_1_B_GENERIC_NAME',
  ruleReference: 'Rule 6(1)(b)',
  title: 'Common or Generic Name of the Commodity',
  statutoryReference: 'Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(b)',
  sourceDocument: 'Official Gazette of India, Notification G.S.R. 202(E) dated 07.03.2011',
  effectiveFrom: '2011-03-07',
  effectiveTo: null,
  severity: 'MAJOR',

  isApplicable(_extraction: NormalizedCommodityExtraction) {
    return {
      applicable: true,
      reason: 'Mandatory declaration on every pre-packaged commodity under Rule 6(1)(b).',
    };
  },

  validate(extraction: NormalizedCommodityExtraction): RuleValidationResult {
    const field = extraction.productName;
    const value = field.value;

    if (field.status === 'missing' || !value?.genericName) {
      return {
        ruleId: this.ruleId,
        ruleReference: this.ruleReference,
        title: this.title,
        requirement: 'Package must display common or generic name of commodity.',
        applicable: true,
        applicabilityReason: 'Mandatory on all pre-packaged commodities.',
        status: 'NOT_DETECTED',
        severity: this.severity,
        reason: 'Generic or common name was not detected on scanned packaging surfaces.',
        evidence: {
          declarationKey: 'generic_name',
          detectedText: null,
          expectedRequirement: 'Common or generic name of commodity',
          actualObserved: 'Not detected in OCR text',
          confidence: field.confidence,
        },
        suggestedRemedy: 'Ensure generic name is legible on Principal Display Panel (PDP).',
        statutoryReference: this.statutoryReference,
      };
    }

    if (field.status === 'uncertain') {
      return {
        ruleId: this.ruleId,
        ruleReference: this.ruleReference,
        title: this.title,
        requirement: 'Package must display common or generic name of commodity.',
        applicable: true,
        applicabilityReason: 'Mandatory on all pre-packaged commodities.',
        status: 'UNCERTAIN',
        severity: this.severity,
        reason: field.ambiguityNotes || 'Generic name extracted from packaging title header without explicit descriptor.',
        evidence: {
          declarationKey: 'generic_name',
          detectedText: field.sourceText,
          expectedRequirement: 'Explicit generic or common commodity description',
          actualObserved: value.genericName,
          confidence: field.confidence,
          boundingBox: field.boundingBox,
        },
        suggestedRemedy: 'Enforcement officer to verify if trade description meets standard generic naming.',
        statutoryReference: this.statutoryReference,
      };
    }

    return {
      ruleId: this.ruleId,
      ruleReference: this.ruleReference,
      title: this.title,
      requirement: 'Package must display common or generic name of commodity.',
      applicable: true,
      applicabilityReason: 'Mandatory on all pre-packaged commodities.',
      status: 'PASS',
      severity: this.severity,
      reason: `Generic/common name clearly declared as "${value.genericName}".`,
      evidence: {
        declarationKey: 'generic_name',
        detectedText: field.sourceText,
        expectedRequirement: 'Common or generic name of commodity',
        actualObserved: value.genericName,
        confidence: field.confidence,
        boundingBox: field.boundingBox,
      },
      statutoryReference: this.statutoryReference,
    };
  },
};
