import type {
  IComplianceRule,
  NormalizedCommodityExtraction,
  RuleValidationResult,
} from '@sih/shared';

export const Rule6_1_a_Manufacturer: IComplianceRule = {
  ruleId: 'LMR_2011_R6_1_A_MANUFACTURER',
  ruleReference: 'Rule 6(1)(a)',
  title: 'Name and Complete Address of Manufacturer / Packer / Importer',
  statutoryReference: 'Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(a)',
  sourceDocument: 'Official Gazette of India, Notification G.S.R. 202(E) dated 07.03.2011',
  effectiveFrom: '2011-03-07',
  effectiveTo: null,
  severity: 'CRITICAL',

  isApplicable(_extraction: NormalizedCommodityExtraction) {
    return {
      applicable: true,
      reason: 'Mandatory declaration on all pre-packaged commodities under Rule 6(1)(a).',
    };
  },

  validate(extraction: NormalizedCommodityExtraction): RuleValidationResult {
    const field = extraction.manufacturerInfo;
    const value = field.value;

    if (field.status === 'missing' || !value) {
      return {
        ruleId: this.ruleId,
        ruleReference: this.ruleReference,
        title: this.title,
        requirement: 'Package must display complete name and postal address of manufacturer, packer, or importer.',
        applicable: true,
        applicabilityReason: 'Mandatory on all pre-packaged commodities.',
        status: 'NOT_DETECTED',
        severity: this.severity,
        reason: 'Manufacturer, packer, or importer details were not detected on scanned packaging surfaces.',
        evidence: {
          declarationKey: 'manufacturer_details',
          detectedText: null,
          expectedRequirement: 'Name and complete postal address',
          actualObserved: 'Not detected in OCR text',
          confidence: field.confidence,
        },
        suggestedRemedy: 'Scan back or side panels containing the manufacturing/marketing address block.',
        statutoryReference: this.statutoryReference,
      };
    }

    if (!value.name) {
      return {
        ruleId: this.ruleId,
        ruleReference: this.ruleReference,
        title: this.title,
        requirement: 'Package must display complete name and postal address.',
        applicable: true,
        applicabilityReason: 'Mandatory on all pre-packaged commodities.',
        status: 'UNCERTAIN',
        severity: this.severity,
        reason: 'Address block detected but company/manufacturer name is ambiguous or incomplete.',
        evidence: {
          declarationKey: 'manufacturer_details',
          detectedText: field.sourceText,
          expectedRequirement: 'Recognizable entity name and address',
          actualObserved: field.sourceText || undefined,
          confidence: field.confidence,
          boundingBox: field.boundingBox,
        },
        suggestedRemedy: 'Verify company name on physical packaging.',
        statutoryReference: this.statutoryReference,
      };
    }

    if (!value.pinCode) {
      return {
        ruleId: this.ruleId,
        ruleReference: this.ruleReference,
        title: this.title,
        requirement: 'Postal address must be complete to enable consumer communication.',
        applicable: true,
        applicabilityReason: 'Mandatory on all pre-packaged commodities.',
        status: 'UNCERTAIN',
        severity: 'MAJOR',
        reason: 'Manufacturer address detected but 6-digit postal PIN code was not found.',
        evidence: {
          declarationKey: 'manufacturer_details',
          detectedText: field.sourceText,
          expectedRequirement: 'Complete address with postal PIN code',
          actualObserved: value.fullAddress || undefined,
          confidence: field.confidence,
          boundingBox: field.boundingBox,
        },
        suggestedRemedy: 'Confirm if 6-digit postal PIN code is stamped elsewhere on the package.',
        statutoryReference: this.statutoryReference,
      };
    }

    return {
      ruleId: this.ruleId,
      ruleReference: this.ruleReference,
      title: this.title,
      requirement: 'Package must display complete name and postal address of manufacturer, packer, or importer.',
      applicable: true,
      applicabilityReason: 'Mandatory on all pre-packaged commodities.',
      status: 'PASS',
      severity: this.severity,
      reason: `Complete ${value.entityType.replace(/_/g, ' ')} declaration detected with verified postal PIN (${value.pinCode}).`,
      evidence: {
        declarationKey: 'manufacturer_details',
        detectedText: field.sourceText,
        expectedRequirement: 'Name and complete postal address',
        actualObserved: `${value.name}, ${value.fullAddress}`,
        confidence: field.confidence,
        boundingBox: field.boundingBox,
      },
      statutoryReference: this.statutoryReference,
    };
  },
};
