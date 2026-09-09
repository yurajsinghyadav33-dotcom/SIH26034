import type {
  IComplianceRule,
  NormalizedCommodityExtraction,
  RuleValidationResult,
} from '@sih/shared';

export const Rule6_1_e_MRP: IComplianceRule = {
  ruleId: 'LMR_2011_R6_1_E_MRP',
  ruleReference: 'Rule 6(1)(e)',
  title: 'Maximum Retail Price (MRP) & Tax Inclusivity Declaration',
  statutoryReference: 'Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(e)',
  sourceDocument: 'Official Gazette of India, Notification G.S.R. 202(E) dated 07.03.2011',
  effectiveFrom: '2011-03-07',
  effectiveTo: null,
  severity: 'CRITICAL',

  isApplicable(_extraction: NormalizedCommodityExtraction) {
    return {
      applicable: true,
      reason: 'Mandatory declaration on all pre-packaged retail commodities under Rule 6(1)(e).',
    };
  },

  validate(extraction: NormalizedCommodityExtraction): RuleValidationResult {
    const field = extraction.mrp;
    const value = field.value;

    if (field.status === 'missing' || !value || value.declaredAmount === null) {
      return {
        ruleId: this.ruleId,
        ruleReference: this.ruleReference,
        title: this.title,
        requirement: 'Retail sale price must be declared as Maximum Retail Price (inclusive of all taxes).',
        applicable: true,
        applicabilityReason: 'Mandatory on all retail packaged goods.',
        status: 'NOT_DETECTED',
        severity: this.severity,
        reason: 'Maximum Retail Price (MRP) was not detected on scanned packaging surfaces.',
        evidence: {
          declarationKey: 'mrp',
          detectedText: null,
          expectedRequirement: 'MRP Rs. / ₹ ... (incl. of all taxes)',
          actualObserved: 'Not detected in OCR text',
          confidence: field.confidence,
        },
        suggestedRemedy: 'Scan price label or Principal Display Panel where MRP is stamped.',
        statutoryReference: this.statutoryReference,
      };
    }

    // Multiple conflicting price candidates
    if (field.status === 'uncertain') {
      return {
        ruleId: this.ruleId,
        ruleReference: this.ruleReference,
        title: this.title,
        requirement: 'A single, unambiguous retail price must be declared without dual pricing confusion.',
        applicable: true,
        applicabilityReason: 'Mandatory on all retail packaged goods.',
        status: 'UNCERTAIN',
        severity: 'CRITICAL',
        reason: field.ambiguityNotes || 'Multiple competing price figures detected on packaging.',
        evidence: {
          declarationKey: 'mrp',
          detectedText: field.sourceText,
          expectedRequirement: 'Single unequivocal MRP statement',
          actualObserved: field.candidateValues?.map((c) => `${c.value.currency} ${c.value.declaredAmount}`).join(', ') || undefined,
          confidence: field.confidence,
          boundingBox: field.boundingBox,
        },
        suggestedRemedy: 'Inspect package for sticker smudging, dual pricing, or conflicting retail tags.',
        statutoryReference: this.statutoryReference,
      };
    }

    // Violation: Tax Inclusivity missing
    if (!value.isTaxInclusiveDeclared) {
      return {
        ruleId: this.ruleId,
        ruleReference: this.ruleReference,
        title: this.title,
        requirement: 'Retail sale price declaration must explicitly state "inclusive of all taxes" or "incl. of all taxes".',
        applicable: true,
        applicabilityReason: 'Mandatory on all retail packaged goods.',
        status: 'FAIL',
        severity: 'CRITICAL',
        reason: 'Statutory violation of Rule 6(1)(e): MRP stated without mandatory "inclusive of all taxes" wording.',
        evidence: {
          declarationKey: 'mrp',
          detectedText: field.sourceText,
          expectedRequirement: 'MRP ₹ ... (inclusive of all taxes)',
          actualObserved: field.sourceText || undefined,
          confidence: field.confidence,
          boundingBox: field.boundingBox,
        },
        suggestedRemedy: 'Update packaging artwork to state "incl. of all taxes" adjacent to MRP.',
        statutoryReference: 'Rule 6(1)(e) of Legal Metrology (Packaged Commodities) Rules, 2011',
      };
    }

    return {
      ruleId: this.ruleId,
      ruleReference: this.ruleReference,
      title: this.title,
      requirement: 'Retail sale price declared as Maximum Retail Price inclusive of all taxes.',
      applicable: true,
      applicabilityReason: 'Mandatory on all retail packaged goods.',
      status: 'PASS',
      severity: this.severity,
      reason: `Compliant MRP declaration: ${value.currency} ${value.declaredAmount.toFixed(2)} (inclusive of all taxes).`,
      evidence: {
        declarationKey: 'mrp',
        detectedText: field.sourceText,
        expectedRequirement: 'MRP inclusive of all taxes',
        actualObserved: `${value.currency} ${value.declaredAmount.toFixed(2)} (inclusive of all taxes)`,
        confidence: field.confidence,
        boundingBox: field.boundingBox,
      },
      statutoryReference: this.statutoryReference,
    };
  },
};
