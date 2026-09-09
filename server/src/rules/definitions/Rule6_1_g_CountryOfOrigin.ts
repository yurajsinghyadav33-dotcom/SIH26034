import type {
  IComplianceRule,
  NormalizedCommodityExtraction,
  RuleValidationResult,
} from '@sih/shared';

export const Rule6_1_g_CountryOfOrigin: IComplianceRule = {
  ruleId: 'LMR_2011_R6_1_G_COUNTRY_OF_ORIGIN',
  ruleReference: 'Rule 6(1)(g)',
  title: 'Country of Origin for Imported Packaged Commodities',
  statutoryReference: 'Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(g) & Advisory WM-10(31)/2020',
  sourceDocument: 'Official Gazette of India, Notification G.S.R. 202(E) dated 07.03.2011',
  effectiveFrom: '2011-03-07',
  effectiveTo: null,
  severity: 'CRITICAL',

  isApplicable(extraction: NormalizedCommodityExtraction) {
    const isImporter = extraction.manufacturerInfo.value?.entityType === 'IMPORTER';
    const isImportedFlag = extraction.countryOfOrigin.value?.isImported === true;

    if (!isImporter && !isImportedFlag) {
      return {
        applicable: false,
        reason: 'Domestic commodity; mandatory Country of Origin declaration under Rule 6(1)(g) applies specifically to imported pre-packaged goods.',
      };
    }

    return {
      applicable: true,
      reason: 'Mandatory declaration for all imported packaged commodities under Rule 6(1)(g).',
    };
  },

  validate(extraction: NormalizedCommodityExtraction): RuleValidationResult {
    const field = extraction.countryOfOrigin;
    const value = field.value;

    if (field.status === 'missing' || !value?.countryName) {
      return {
        ruleId: this.ruleId,
        ruleReference: this.ruleReference,
        title: this.title,
        requirement: 'The name of the country of origin or manufacture shall be mentioned on imported packages.',
        applicable: true,
        applicabilityReason: 'Mandatory for imported pre-packaged commodities.',
        status: 'FAIL',
        severity: this.severity,
        reason: 'Statutory violation of Rule 6(1)(g): Imported commodity package does not state country of origin.',
        evidence: {
          declarationKey: 'country_of_origin',
          detectedText: null,
          expectedRequirement: 'Country of Origin / Made in [Country]',
          actualObserved: 'Not detected in OCR text',
          confidence: field.confidence,
        },
        suggestedRemedy: 'Add explicit "Country of Origin: [Country]" to imported package Principal Display Panel.',
        statutoryReference: this.statutoryReference,
      };
    }

    return {
      ruleId: this.ruleId,
      ruleReference: this.ruleReference,
      title: this.title,
      requirement: 'The name of the country of origin or manufacture shall be mentioned on imported packages.',
      applicable: true,
      applicabilityReason: 'Mandatory for imported pre-packaged commodities.',
      status: 'PASS',
      severity: this.severity,
      reason: `Compliant Country of Origin declaration detected: ${value.countryName}.`,
      evidence: {
        declarationKey: 'country_of_origin',
        detectedText: field.sourceText,
        expectedRequirement: 'Declared country of origin',
        actualObserved: value.declarationPhrase || value.countryName,
        confidence: field.confidence,
        boundingBox: field.boundingBox,
      },
      statutoryReference: this.statutoryReference,
    };
  },
};
