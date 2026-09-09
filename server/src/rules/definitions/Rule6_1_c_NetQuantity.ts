import type {
  IComplianceRule,
  NormalizedCommodityExtraction,
  RuleValidationResult,
} from '@sih/shared';

// Standard SI units permitted under Rule 11 and Second Schedule
const PERMITTED_SI_UNITS = new Set(['g', 'kg', 'ml', 'l', 'm', 'cm', 'N']);

export const Rule6_1_c_NetQuantity: IComplianceRule = {
  ruleId: 'LMR_2011_R6_1_C_NET_QUANTITY',
  ruleReference: 'Rule 6(1)(c) read with Rules 11 & 12',
  title: 'Standard Net Quantity & Prohibition of Approximate Modifiers',
  statutoryReference: 'Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(c), Rule 11, Rule 12',
  sourceDocument: 'Official Gazette of India, Notification G.S.R. 202(E) dated 07.03.2011',
  effectiveFrom: '2011-03-07',
  effectiveTo: null,
  severity: 'CRITICAL',

  isApplicable(extraction: NormalizedCommodityExtraction) {
    // Exempt under Rule 26 if bulk wholesale package (> 25 kg or 25 litres)
    const val = extraction.netQuantity.value;
    if (val && val.numericValue && ((val.normalizedUnit === 'kg' && val.numericValue > 25) || (val.normalizedUnit === 'l' && val.numericValue > 25))) {
      return {
        applicable: false,
        reason: 'Exempt under Rule 26: Bulk packages exceeding 25 kg or 25 litres.',
      };
    }

    return {
      applicable: true,
      reason: 'Mandatory declaration on pre-packaged commodities under Rule 6(1)(c).',
    };
  },

  validate(extraction: NormalizedCommodityExtraction): RuleValidationResult {
    const field = extraction.netQuantity;
    const value = field.value;

    if (field.status === 'missing' || !value || value.numericValue === null) {
      return {
        ruleId: this.ruleId,
        ruleReference: this.ruleReference,
        title: this.title,
        requirement: 'Net quantity must be declared in standard units of weight, measure or number without qualifiers.',
        applicable: true,
        applicabilityReason: 'Mandatory on pre-packaged commodities.',
        status: 'NOT_DETECTED',
        severity: this.severity,
        reason: 'Net quantity statement was not detected on scanned packaging surfaces.',
        evidence: {
          declarationKey: 'net_quantity',
          detectedText: null,
          expectedRequirement: 'Standard net quantity (e.g. 400 g, 1 L, 1 N)',
          actualObserved: 'Not detected in OCR text',
          confidence: field.confidence,
        },
        suggestedRemedy: 'Scan Principal Display Panel (PDP) where net quantity declaration is legally mandated.',
        statutoryReference: this.statutoryReference,
      };
    }

    // 1. Violation of Rule 12: Prohibition of approximate modifiers
    if (value.isApproximatePrefixDetected) {
      return {
        ruleId: this.ruleId,
        ruleReference: this.ruleReference,
        title: this.title,
        requirement: 'No qualification, whether approximate or otherwise, shall be expressed in relation to net quantity.',
        applicable: true,
        applicabilityReason: 'Mandatory on pre-packaged commodities.',
        status: 'FAIL',
        severity: 'CRITICAL',
        reason: 'Statutory violation of Rule 12: Prohibited qualifying modifier (e.g., "approx", "when packed") detected in net quantity declaration.',
        evidence: {
          declarationKey: 'net_quantity',
          detectedText: field.sourceText,
          expectedRequirement: 'Strict unqualified metric declaration (e.g. "Net Qty: 500 g")',
          actualObserved: field.sourceText || undefined,
          confidence: field.confidence,
          boundingBox: field.boundingBox,
        },
        suggestedRemedy: 'Remove approximate prefixes ("approx", "when packed") from packaging artwork.',
        statutoryReference: 'Rule 12 of Legal Metrology (Packaged Commodities) Rules, 2011',
      };
    }

    // 2. Violation of Rule 11: Non-standard unit symbol
    const unit = value.normalizedUnit || '';
    if (!PERMITTED_SI_UNITS.has(unit)) {
      return {
        ruleId: this.ruleId,
        ruleReference: this.ruleReference,
        title: this.title,
        requirement: 'Net quantity must use standard SI symbols prescribed under Rule 11 and Second Schedule.',
        applicable: true,
        applicabilityReason: 'Mandatory on pre-packaged commodities.',
        status: 'FAIL',
        severity: 'MAJOR',
        reason: `Statutory violation of Rule 11: Unapproved unit symbol "${value.declaredUnit}" detected. Prescribed units are g, kg, ml, l, m, cm, N.`,
        evidence: {
          declarationKey: 'net_quantity',
          detectedText: field.sourceText,
          expectedRequirement: 'Standard symbol from Second Schedule (g, kg, ml, l, N)',
          actualObserved: value.declaredUnit || undefined,
          confidence: field.confidence,
          boundingBox: field.boundingBox,
        },
        suggestedRemedy: `Replace "${value.declaredUnit}" with standard statutory symbol (e.g., "g" or "ml").`,
        statutoryReference: 'Rule 11 read with Second Schedule of LMR, 2011',
      };
    }

    // 3. Ambiguity preservation if multiple conflicting weights
    if (field.status === 'uncertain') {
      return {
        ruleId: this.ruleId,
        ruleReference: this.ruleReference,
        title: this.title,
        requirement: 'Net quantity must be unambiguous and clearly declared.',
        applicable: true,
        applicabilityReason: 'Mandatory on pre-packaged commodities.',
        status: 'UNCERTAIN',
        severity: 'MAJOR',
        reason: field.ambiguityNotes || 'Multiple competing quantity declarations detected on packaging.',
        evidence: {
          declarationKey: 'net_quantity',
          detectedText: field.sourceText,
          expectedRequirement: 'Single unambiguous net quantity statement',
          actualObserved: field.sourceText || undefined,
          confidence: field.confidence,
          boundingBox: field.boundingBox,
        },
        suggestedRemedy: 'Officer to verify physical label to confirm true net weight.',
        statutoryReference: this.statutoryReference,
      };
    }

    return {
      ruleId: this.ruleId,
      ruleReference: this.ruleReference,
      title: this.title,
      requirement: 'Net quantity declared in standard metric units without approximate qualification.',
      applicable: true,
      applicabilityReason: 'Mandatory on pre-packaged commodities.',
      status: 'PASS',
      severity: this.severity,
      reason: `Compliant net quantity declaration: ${value.numericValue} ${value.normalizedUnit}.`,
      evidence: {
        declarationKey: 'net_quantity',
        detectedText: field.sourceText,
        expectedRequirement: 'Standard net quantity without qualifiers',
        actualObserved: `${value.numericValue} ${value.normalizedUnit}`,
        confidence: field.confidence,
        boundingBox: field.boundingBox,
      },
      statutoryReference: this.statutoryReference,
    };
  },
};
