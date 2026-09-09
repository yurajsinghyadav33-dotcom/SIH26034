import type {
  IComplianceRule,
  NormalizedCommodityExtraction,
  RuleValidationResult,
} from '@sih/shared';

export const Rule6_1_d_Dates: IComplianceRule = {
  ruleId: 'LMR_2011_R6_1_D_DATES',
  ruleReference: 'Rule 6(1)(d)',
  title: 'Month and Year of Manufacture / Packing / Import',
  statutoryReference: 'Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(d)',
  sourceDocument: 'Official Gazette of India, Notification G.S.R. 202(E) dated 07.03.2011',
  effectiveFrom: '2011-03-07',
  effectiveTo: null,
  severity: 'CRITICAL',

  isApplicable(_extraction: NormalizedCommodityExtraction) {
    return {
      applicable: true,
      reason: 'Mandatory declaration on pre-packaged commodities under Rule 6(1)(d).',
    };
  },

  validate(extraction: NormalizedCommodityExtraction): RuleValidationResult {
    const field = extraction.dates;
    const value = field.value;

    const primaryDate =
      value?.dateOfManufacture ||
      value?.dateOfPackaging ||
      value?.dateOfImport;

    if (field.status === 'missing' || !primaryDate) {
      return {
        ruleId: this.ruleId,
        ruleReference: this.ruleReference,
        title: this.title,
        requirement: 'Month and year of manufacture or pre-packing or import must be stated on package.',
        applicable: true,
        applicabilityReason: 'Mandatory on pre-packaged commodities.',
        status: 'NOT_DETECTED',
        severity: this.severity,
        reason: 'Date of manufacture/packing/import was not detected on scanned packaging surfaces.',
        evidence: {
          declarationKey: 'date_of_manufacture',
          detectedText: null,
          expectedRequirement: 'Month and Year (e.g., 01/2026 or Jan 2026)',
          actualObserved: 'Not detected in OCR text',
          confidence: field.confidence,
        },
        suggestedRemedy: 'Inspect packaging for embossed or inkjet printed date codes.',
        statutoryReference: this.statutoryReference,
      };
    }

    if (!primaryDate.month || !primaryDate.year) {
      return {
        ruleId: this.ruleId,
        ruleReference: this.ruleReference,
        title: this.title,
        requirement: 'Both month and year must be clearly declared.',
        applicable: true,
        applicabilityReason: 'Mandatory on pre-packaged commodities.',
        status: 'UNCERTAIN',
        severity: 'MAJOR',
        reason: `Incomplete date declaration "${primaryDate.rawText}". Both month and year are statutory requirements.`,
        evidence: {
          declarationKey: 'date_of_manufacture',
          detectedText: primaryDate.rawText,
          expectedRequirement: 'Month and Year (MM/YYYY or Month Year)',
          actualObserved: primaryDate.rawText,
          confidence: field.confidence,
          boundingBox: field.boundingBox,
        },
        suggestedRemedy: 'Verify if calendar month is stamped adjacent to year.',
        statutoryReference: this.statutoryReference,
      };
    }

    return {
      ruleId: this.ruleId,
      ruleReference: this.ruleReference,
      title: this.title,
      requirement: 'Month and year of manufacture or pre-packing or import must be stated on package.',
      applicable: true,
      applicabilityReason: 'Mandatory on pre-packaged commodities.',
      status: 'PASS',
      severity: this.severity,
      reason: `Compliant date declaration detected: ${primaryDate.dateString}.`,
      evidence: {
        declarationKey: 'date_of_manufacture',
        detectedText: primaryDate.rawText,
        expectedRequirement: 'Month and Year of manufacture or packing',
        actualObserved: primaryDate.dateString,
        confidence: field.confidence,
        boundingBox: field.boundingBox,
      },
      statutoryReference: this.statutoryReference,
    };
  },
};
