import type {
  IComplianceRule,
  NormalizedCommodityExtraction,
  RuleValidationResult,
} from '@sih/shared';

export const Rule6_11_UnitSalePrice: IComplianceRule = {
  ruleId: 'LMR_2021_R6_11_UNIT_SALE_PRICE',
  ruleReference: 'Rule 6(11)',
  title: 'Mandatory Declaration of Unit Sale Price (USP)',
  statutoryReference: 'Legal Metrology (Packaged Commodities) Amendment Rules, 2021, Rule 6(11)',
  sourceDocument: 'Official Gazette of India, Notification G.S.R. 779(E) dated 02.11.2021',
  effectiveFrom: '2022-12-01', // Effective from 01.12.2022 after official deferrals
  effectiveTo: null,
  severity: 'CRITICAL',

  isApplicable(extraction: NormalizedCommodityExtraction) {
    // 1. Check Date of Manufacture/Packing for Temporal Safety
    const mfgDate = extraction.dates.value?.dateOfManufacture || extraction.dates.value?.dateOfPackaging;
    if (mfgDate && mfgDate.year && mfgDate.month) {
      // If packed before December 2022, Rule 6(11) was not in statutory force
      if (mfgDate.year < 2022 || (mfgDate.year === 2022 && mfgDate.month < 12)) {
        return {
          applicable: false,
          reason: `Exempt: Commodity manufactured/packed in ${mfgDate.dateString}, prior to official enforcement date of Rule 6(11) (01 December 2022).`,
        };
      }
    }

    // 2. Check Package Size Exemption (Packages <= 10g or <= 10ml)
    const netQty = extraction.netQuantity.value;
    if (netQty && netQty.numericValue !== null) {
      if ((netQty.normalizedUnit === 'g' || netQty.normalizedUnit === 'ml') && netQty.numericValue <= 10) {
        return {
          applicable: false,
          reason: `Statutory Exemption under Rule 6(11) proviso: Package containing net quantity <= 10g or 10ml (${netQty.numericValue} ${netQty.normalizedUnit}).`,
        };
      }
    }

    return {
      applicable: true,
      reason: 'Mandatory declaration for pre-packaged commodities packed on or after 01 Dec 2022.',
    };
  },

  validate(extraction: NormalizedCommodityExtraction): RuleValidationResult {
    const field = extraction.unitSalePrice;
    const value = field.value;
    const netQty = extraction.netQuantity.value;

    // Single item / piece proviso: If 1 number/piece (1 N), and MRP equals unit sale price
    if (netQty?.normalizedUnit === 'N' && netQty.numericValue === 1) {
      return {
        ruleId: this.ruleId,
        ruleReference: this.ruleReference,
        title: this.title,
        requirement: 'Unit sale price declaration for pre-packaged commodities.',
        applicable: true,
        applicabilityReason: 'Mandatory on retail packages.',
        status: 'PASS',
        severity: this.severity,
        reason: 'Compliant under Rule 6(11) proviso: For a single unit package (1 N), declared MRP serves as unit sale price.',
        evidence: {
          declarationKey: 'unit_sale_price',
          detectedText: field.sourceText || extraction.mrp.sourceText,
          expectedRequirement: 'Unit sale price per number',
          actualObserved: '1 N package; MRP satisfies unit rate',
          confidence: field.confidence || extraction.mrp.confidence,
        },
        statutoryReference: this.statutoryReference,
      };
    }

    if (field.status === 'missing' || !value || value.rate === null) {
      return {
        ruleId: this.ruleId,
        ruleReference: this.ruleReference,
        title: this.title,
        requirement: 'Unit sale price must be declared in rupees per gram/ml (if <= 1kg/1L) or per kg/L (if > 1kg/1L) or per piece.',
        applicable: true,
        applicabilityReason: 'Mandatory for commodities packed on/after 01 Dec 2022.',
        status: 'NOT_DETECTED',
        severity: this.severity,
        reason: 'Unit Sale Price (USP) was not detected on scanned packaging surfaces.',
        evidence: {
          declarationKey: 'unit_sale_price',
          detectedText: null,
          expectedRequirement: 'e.g., ₹ ... / g or ₹ ... / ml',
          actualObserved: 'Not detected in OCR text',
          confidence: field.confidence,
        },
        suggestedRemedy: 'Verify if Unit Sale Price is stamped adjacent to MRP on packaging.',
        statutoryReference: this.statutoryReference,
      };
    }

    return {
      ruleId: this.ruleId,
      ruleReference: this.ruleReference,
      title: this.title,
      requirement: 'Unit sale price declared in rupees rounded off to nearest two decimal places.',
      applicable: true,
      applicabilityReason: 'Mandatory for commodities packed on/after 01 Dec 2022.',
      status: 'PASS',
      severity: this.severity,
      reason: `Compliant Unit Sale Price declaration detected: ${value.currency} ${value.rate.toFixed(2)} per ${value.unit}.`,
      evidence: {
        declarationKey: 'unit_sale_price',
        detectedText: field.sourceText,
        expectedRequirement: 'Unit sale price per g/ml/kg/l/N',
        actualObserved: `${value.currency} ${value.rate.toFixed(2)} / ${value.unit}`,
        confidence: field.confidence,
        boundingBox: field.boundingBox,
      },
      statutoryReference: this.statutoryReference,
    };
  },
};
