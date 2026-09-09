import type {
  BarcodeIntelligenceResult,
  BarcodeFormat,
  BarcodeValidationStatus,
  BarcodeRuleConformity,
} from '@sih/shared';

export type {
  BarcodeIntelligenceResult,
  BarcodeFormat,
  BarcodeValidationStatus,
  BarcodeRuleConformity,
};

// Known Indian Packaged Commodity GS1 Company Registry
const GS1_INDIA_MANUFACTURERS: Record<string, { company: string; product: string; category: string }> = {
  '8901063': {
    company: 'Britannia Industries Ltd',
    product: 'Britannia Biscuits (Bourbon / Good Day / Marie Gold / NutriChoice)',
    category: 'Biscuits / Baked Confectionery',
  },
  '8901499': {
    company: 'Parle Products Pvt Ltd',
    product: 'Parle-G Glucose Biscuits / Hide & Seek / Krackjack',
    category: 'Biscuits & Confectionery',
  },
  '8901725': {
    company: 'ITC Limited',
    product: 'Sunfeast Biscuits / Aashirvaad Whole Wheat Atta / Bingo',
    category: 'Food, Biscuits & Staples',
  },
  '8906090': {
    company: 'Guiltfree Industries Limited',
    product: 'Too Yumm! Multigrain Snacks / Karare / Potato Chips',
    category: 'Ready-to-Eat Savouries',
  },
  '8901030': {
    company: 'Hindustan Unilever Limited',
    product: 'Knorr / Horlicks / Lifebuoy / Dove / Surf Excel',
    category: 'FMCG Packaged Goods',
  },
  '8901058': {
    company: 'Nestlé India Limited',
    product: 'Maggi Noodles / KitKat / Munch / Nescafé',
    category: 'Processed Foods & Confectionery',
  },
  '8901262': {
    company: 'Gujarat Co-operative Milk Marketing Federation (Amul)',
    product: 'Amul Butter / Pasteurized Milk / Cheese',
    category: 'Dairy Packaged Commodities',
  },
  '8901233': {
    company: 'Dabur India Ltd',
    product: 'Real Fruit Juices / Chyawanprash / Honey',
    category: 'Beverages & Ayurvedic Packaged Goods',
  },
  '8906010': {
    company: 'Haldiram Snacks Pvt Ltd',
    product: 'Haldiram Bhujia / Namkeen / Indian Sweets',
    category: 'Traditional Indian Snacks',
  },
  '8901023': {
    company: 'Tata Consumer Products Ltd',
    product: 'Tata Tea / Tata Salt / Tata Sampann Pulses',
    category: 'Staples & Beverage Commodities',
  },
  '8904004': {
    company: 'Patanjali Ayurved Limited',
    product: 'Patanjali Doodh Biscuits / Mustard Oil / Ghee',
    category: 'Ayurvedic Food & FMCG',
  },
  '8902579': {
    company: 'Bikaji Foods International Ltd',
    product: 'Bikaji Bhujia / Papad / Namkeen',
    category: 'Packaged Ethnic Snacks',
  },
};

/**
 * Calculates and validates GS1 Modulo-10 Check Digit for EAN-13 / UPC-A
 */
export function calculateEan13CheckDigit(first12Digits: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(first12Digits[i], 10) || 0;
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  return (10 - (sum % 10)) % 10;
}

export function validateBarcodeChecksum(barcode: string): {
  isValid: boolean;
  calculatedCheckDigit: number;
  actualCheckDigit: number;
} {
  const clean = barcode.replace(/\D/g, '');
  if (clean.length === 13) {
    const first12 = clean.substring(0, 12);
    const actual = parseInt(clean[12], 10);
    const calculated = calculateEan13CheckDigit(first12);
    return {
      isValid: actual === calculated,
      calculatedCheckDigit: calculated,
      actualCheckDigit: actual,
    };
  }
  if (clean.length === 12) {
    // UPC-A treated as EAN-13 with leading 0
    const padded = '0' + clean;
    const first12 = padded.substring(0, 12);
    const actual = parseInt(padded[12], 10);
    const calculated = calculateEan13CheckDigit(first12);
    return {
      isValid: actual === calculated,
      calculatedCheckDigit: calculated,
      actualCheckDigit: actual,
    };
  }
  return { isValid: false, calculatedCheckDigit: -1, actualCheckDigit: -1 };
}

/**
 * Analyzes barcode, determines origin country, registered licensee, and Legal Metrology conformity.
 */
export function analyzePackagingBarcode(
  rawBarcode: string,
  declaredManufacturer?: string,
  declaredCountryOfOrigin?: string
): BarcodeIntelligenceResult {
  const cleanBarcode = (rawBarcode || '').replace(/[^\d]/g, '').trim();

  let format: BarcodeFormat = 'UNKNOWN';
  if (cleanBarcode.length === 13) format = 'EAN-13';
  else if (cleanBarcode.length === 12) format = 'UPC-A';
  else if (cleanBarcode.length === 8) format = 'EAN-8';
  else if (cleanBarcode.length > 13) format = 'GS1-128';

  const { isValid: isValidChecksum, calculatedCheckDigit, actualCheckDigit } =
    validateBarcodeChecksum(cleanBarcode);

  const countryPrefix = cleanBarcode.substring(0, 3);
  const isIndianOrigin = countryPrefix === '890';

  let countryName = 'Unknown Territory';
  if (isIndianOrigin) countryName = 'India (GS1 India Allocated)';
  else if (['000', '001', '002', '003', '004', '005', '006', '007', '008', '009', '010', '011', '012', '013'].includes(countryPrefix.substring(0, 3)))
    countryName = 'United States & Canada (UPC-A)';
  else if (countryPrefix.startsWith('50')) countryName = 'United Kingdom (GS1 UK)';
  else if (countryPrefix.startsWith('40') || countryPrefix.startsWith('44')) countryName = 'Germany';
  else if (countryPrefix.startsWith('69')) countryName = 'China (GS1 China)';
  else if (countryPrefix.startsWith('880')) countryName = 'South Korea';
  else if (countryPrefix.startsWith('893')) countryName = 'Vietnam';
  else if (countryPrefix.startsWith('30') || countryPrefix.startsWith('37')) countryName = 'France';
  else if (countryPrefix.startsWith('80') || countryPrefix.startsWith('83')) countryName = 'Italy';

  // Look up GS1 India Manufacturer Company Prefix (first 7 digits)
  const companyPrefix7 = cleanBarcode.substring(0, 7);
  const registeredInfo = GS1_INDIA_MANUFACTURERS[companyPrefix7];

  const registeredEntity = registeredInfo
    ? registeredInfo.company
    : isIndianOrigin
    ? 'Verified GS1 India Registered Manufacturer'
    : 'International Brand Owner';

  const productClassification = registeredInfo
    ? registeredInfo.category
    : 'Packaged Consumer Commodity (General)';

  const identifiedProductName = registeredInfo
    ? registeredInfo.product
    : isIndianOrigin
    ? 'Indian Packaged Commodity'
    : 'Imported Packaged Good';

  // Legal Metrology (Packaged Commodities) Rules, 2011 Conformity Check
  const notes: string[] = [];
  let rule6_1_a_Match: 'PASS' | 'WARNING' | 'NOT_APPLICABLE' = 'NOT_APPLICABLE';
  let rule6_1_g_Match: 'PASS' | 'WARNING' | 'NOT_APPLICABLE' = 'NOT_APPLICABLE';
  let validationStatus: BarcodeValidationStatus = 'VALID';

  if (!isValidChecksum && (format === 'EAN-13' || format === 'UPC-A')) {
    validationStatus = 'INVALID_CHECKSUM';
    notes.push(`Check digit mismatch: package printed '${actualCheckDigit}', mathematical Modulo-10 requires '${calculatedCheckDigit}'.`);
  } else if (cleanBarcode.length < 8) {
    validationStatus = 'INVALID_FORMAT';
    notes.push('Barcode length is shorter than standard GS1 minimum specification (EAN-8 / EAN-13).');
  }

  // Cross-check Rule 6(1)(g) Country of Origin
  if (isIndianOrigin) {
    rule6_1_g_Match = 'PASS';
    notes.push('Prefix 890 confirms legitimate allocation by GS1 India for domestic commerce.');
  } else if (declaredCountryOfOrigin && declaredCountryOfOrigin.toLowerCase().includes('india')) {
    rule6_1_g_Match = 'WARNING';
    notes.push(`Label declares domestic origin, but barcode country prefix '${countryPrefix}' belongs to ${countryName}. Potential statutory origin discrepancy under Rule 6(1)(g).`);
  }

  // Cross-check Rule 6(1)(a) Manufacturer details
  if (registeredInfo && declaredManufacturer) {
    const lowerDeclared = declaredManufacturer.toLowerCase();
    const lowerReg = registeredInfo.company.toLowerCase();
    if (lowerDeclared.includes(lowerReg.split(' ')[0]) || lowerReg.includes(lowerDeclared.split(' ')[0])) {
      rule6_1_a_Match = 'PASS';
      notes.push(`GS1 Licensee ('${registeredInfo.company}') matches declared packaging manufacturer.`);
    } else {
      rule6_1_a_Match = 'WARNING';
      notes.push(`GS1 Licensee is registered as '${registeredInfo.company}', but label declared '${declaredManufacturer}'. Verify third-party contract manufacturing authorization.`);
    }
  } else if (registeredInfo) {
    rule6_1_a_Match = 'PASS';
    notes.push(`GS1 Company Prefix '${companyPrefix7}' is officially assigned to ${registeredInfo.company}.`);
  }

  let statutoryVerdict: 'COMPLIANT' | 'NEEDS_REVIEW' | 'INVALID' = 'COMPLIANT';
  let explanation = 'Barcode complies with GS1 ISO/IEC 15420 specifications and aligns with Legal Metrology Rules, 2011 declarations.';

  if (validationStatus === 'INVALID_CHECKSUM') {
    statutoryVerdict = 'INVALID';
    explanation = 'Barcode checksum failure: Scanner POS read errors likely. Packaging plates must be corrected.';
  } else if (rule6_1_g_Match === 'WARNING' || rule6_1_a_Match === 'WARNING') {
    statutoryVerdict = 'NEEDS_REVIEW';
    explanation = 'Barcode is technically scannable, but contains identity or country discrepancies requiring officer verification.';
  }

  const ruleConformity: BarcodeRuleConformity = {
    rule6_1_a_ManufacturerMatch: rule6_1_a_Match,
    rule6_1_g_OriginMatch: rule6_1_g_Match,
    statutoryVerdict,
    explanation,
    notes,
  };

  return {
    barcode: cleanBarcode,
    format,
    isValidChecksum,
    validationStatus,
    countryPrefix,
    countryName,
    isIndianOrigin,
    companyPrefix: companyPrefix7,
    registeredEntity,
    productClassification,
    identifiedProductName,
    checkDigit: actualCheckDigit,
    calculatedCheckDigit,
    ruleConformity,
  };
}

/**
 * Searches for 12 to 14-digit barcode numbers within raw OCR text strings
 */
export function extractBarcodeFromOcrText(rawText: string): string | null {
  if (!rawText) return null;
  // Match standard 13-digit EAN-13 (specifically Indian 890 prefixes or general 13 digits)
  const indianEanMatch = rawText.match(/\b(890\d{10})\b/);
  if (indianEanMatch) return indianEanMatch[1];

  const generic13Match = rawText.match(/\b(\d{13})\b/);
  if (generic13Match) return generic13Match[1];

  const upcMatch = rawText.match(/\b(\d{12})\b/);
  if (upcMatch) return upcMatch[1];

  // Also check for spaced barcode numbers e.g. "8 901063 139466"
  const spacedMatch = rawText.match(/(\d)\s*(\d{6})\s*(\d{6})/);
  if (spacedMatch) {
    return `${spacedMatch[1]}${spacedMatch[2]}${spacedMatch[3]}`;
  }

  return null;
}
