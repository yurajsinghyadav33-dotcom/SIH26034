import type {
  IComplianceRule,
  NormalizedCommodityExtraction,
  RuleValidationResult,
} from '@sih/shared';

export const Rule6_1_n_ConsumerCare: IComplianceRule = {
  ruleId: 'LMR_2011_R6_1_N_CONSUMER_CARE',
  ruleReference: 'Rule 6(1)(n)',
  title: 'Consumer Care Contact Details (Helpline & Redressal)',
  statutoryReference: 'Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(n)',
  sourceDocument: 'Official Gazette of India, Notification G.S.R. 202(E) dated 07.03.2011',
  effectiveFrom: '2011-03-07',
  effectiveTo: null,
  severity: 'CRITICAL',

  isApplicable(_extraction: NormalizedCommodityExtraction) {
    return {
      applicable: true,
      reason: 'Mandatory declaration on every pre-packaged retail commodity under Rule 6(1)(n).',
    };
  },

  validate(extraction: NormalizedCommodityExtraction): RuleValidationResult {
    const field = extraction.consumerCare;
    const value = field.value;

    if (field.status === 'missing' || !value) {
      return {
        ruleId: this.ruleId,
        ruleReference: this.ruleReference,
        title: this.title,
        requirement: 'Package must display name, address, telephone number, and email address for consumer complaints.',
        applicable: true,
        applicabilityReason: 'Mandatory on all retail packaged goods.',
        status: 'NOT_DETECTED',
        severity: this.severity,
        reason: 'Consumer care contact details were not detected on scanned packaging surfaces.',
        evidence: {
          declarationKey: 'consumer_care',
          detectedText: null,
          expectedRequirement: 'Telephone helpline number and email address',
          actualObserved: 'Not detected in OCR text',
          confidence: field.confidence,
        },
        suggestedRemedy: 'Scan panel containing customer grievance redressal block.',
        statutoryReference: this.statutoryReference,
      };
    }

    // Explicit statutory violation: Telephone helpline missing
    if (!value.phone) {
      return {
        ruleId: this.ruleId,
        ruleReference: this.ruleReference,
        title: this.title,
        requirement: 'Rule 6(1)(n) explicitly mandates a telephone helpline number for consumer redressal.',
        applicable: true,
        applicabilityReason: 'Mandatory on all retail packaged goods.',
        status: 'FAIL',
        severity: 'CRITICAL',
        reason: 'Statutory violation of Rule 6(1)(n): Consumer grievance telephone number / helpline is missing from package.',
        evidence: {
          declarationKey: 'consumer_care',
          detectedText: field.sourceText,
          expectedRequirement: 'Mandatory telephone number',
          actualObserved: `Email present (${value.email || 'None'}), Telephone missing`,
          confidence: field.confidence,
          boundingBox: field.boundingBox,
        },
        suggestedRemedy: 'Add working telephone helpline / toll-free contact number to consumer care panel.',
        statutoryReference: 'Rule 6(1)(n) of Legal Metrology (Packaged Commodities) Rules, 2011',
      };
    }

    return {
      ruleId: this.ruleId,
      ruleReference: this.ruleReference,
      title: this.title,
      requirement: 'Package must display name, address, telephone number, and email address for consumer complaints.',
      applicable: true,
      applicabilityReason: 'Mandatory on all retail packaged goods.',
      status: 'PASS',
      severity: this.severity,
      reason: `Compliant consumer redressal declarations detected (Phone: ${value.phone}${value.email ? `, Email: ${value.email}` : ''}).`,
      evidence: {
        declarationKey: 'consumer_care',
        detectedText: field.sourceText,
        expectedRequirement: 'Telephone helpline and consumer redressal details',
        actualObserved: `Phone: ${value.phone}, Email: ${value.email || 'N/A'}`,
        confidence: field.confidence,
        boundingBox: field.boundingBox,
      },
      statutoryReference: this.statutoryReference,
    };
  },
};
