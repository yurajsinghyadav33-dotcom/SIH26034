import { labelExtractor } from './LabelExtractor.js';
import type { RawOcrInput } from '@sih/shared';

// Test OCR Samples
const SAMPLE_1_FMCG_FOOD: RawOcrInput = {
  rawText: `
    NutriDaily Instant Masala Oats
    Generic Name: Instant Rolled Oats with Spices
    Manufactured & Packed By: NutriDaily Foods Pvt Ltd, Plot 44, Udyog Vihar, Gurugram, Haryana - 122016
    Country of Origin: India
    Net Qty: 400 g
    MFD: 01/2026
    EXP: 01/2027
    Batch No: BCH-2026-04A
    Best before 12 months from manufacture
    MRP Rs. 120.00 (inclusive of all taxes)
    USP: Rs. 0.30 / g
    In case of consumer complaints call Toll-Free: 1800-110-8899 or email: feedback@nutridaily.com
    Address: Consumer Care Manager, NutriDaily Foods, Gurugram
    Store in a cool and dry place
    100% Vegetarian
  `,
  ocrProvider: 'mock_tesseract',
  pdpDimensions: { heightMm: 185, widthMm: 120, areaSqCm: 222 },
};

const SAMPLE_2_COSMETICS_AMBIGUOUS_PRICES: RawOcrInput = {
  rawText: `
    AuraBotanics Herbal Hydration Sunscreen SPF 50
    Product Name: Herbal Sunscreen Lotion
    Manufactured By: Aura Botanics India Ltd, Industrial Area, Solan, HP - 173205
    Country of Origin: India
    Net Content: 100 ml
    MFD: 12/2025
    Batch No: AB-88910
    MRP Rs. 499.00 (inclusive of all taxes)
    Special Offer MRP Rs. 449.00
    For feedback contact: contact@aurabotanics.com
  `,
  ocrProvider: 'mock_google_vision',
};

const SAMPLE_3_IMPORTED_ELECTRONICS: RawOcrInput = {
  rawText: `
    SonicWave Wireless Bluetooth Earbuds Pro
    Commodity: True Wireless In-Ear Earphones
    Imported By: SonicWave Tech India Pvt Ltd, Andheri East, Mumbai, Maharashtra - 400069
    Made in Vietnam
    Quantity: 1 N
    Date of Import: 02/2026
    MRP: ₹ 1,899.00 (Incl. of all taxes)
    Unit Sale Price: ₹ 1,899.00 / N
    Customer Care Helpline: 022-28499201 Email: support@sonicwave.in
  `,
  ocrProvider: 'mock_aws_textract',
};

const SAMPLE_4_NOISY_DEFECTIVE_OCR: RawOcrInput = {
  rawText: `
    Crunchy Snack Bites
    Net Weight: 250 g (approx when packed)
    Packed by ABC Traders
    Some faded text here...
    Exp: Dec 2026
    1800-222
  `,
  ocrProvider: 'mock_noisy_scanner',
};

export function runExtractionTests(): boolean {
  console.log('=== [SIH26034] STARTING NORMALIZED EXTRACTION TESTS ===\n');

  // Test 1: Standard FMCG Food
  console.log('--- Test 1: Standard FMCG Food Package ---');
  const res1 = labelExtractor.extract(SAMPLE_1_FMCG_FOOD);
  console.log('Product Generic Name:', res1.productName.value?.genericName, `[Status: ${res1.productName.status}]`);
  console.log('MRP Declared:', res1.mrp.value?.declaredAmount, `Tax Included: ${res1.mrp.value?.isTaxInclusiveDeclared}`, `[Status: ${res1.mrp.status}]`);
  console.log('USP Declared:', res1.unitSalePrice.value?.rate, `per ${res1.unitSalePrice.value?.unit}`, `[Status: ${res1.unitSalePrice.status}]`);
  console.log('Net Quantity:', res1.netQuantity.value?.numericValue, res1.netQuantity.value?.normalizedUnit, `[Status: ${res1.netQuantity.status}]`);
  console.log('Mfg Date:', res1.dates.value?.dateOfManufacture?.dateString, 'Exp Date:', res1.dates.value?.expiryDate?.dateString);
  console.log('Consumer Care:', res1.consumerCare.value?.phone, res1.consumerCare.value?.email);
  console.log('Manufacturer:', res1.manufacturerInfo.value?.name, 'PIN:', res1.manufacturerInfo.value?.pinCode);
  console.log('Country of Origin:', res1.countryOfOrigin.value?.countryName, `Imported: ${res1.countryOfOrigin.value?.isImported}`);
  
  if (
    res1.mrp.status !== 'detected' ||
    res1.mrp.value?.declaredAmount !== 120 ||
    res1.unitSalePrice.status !== 'detected' ||
    res1.unitSalePrice.value?.rate !== 0.30 ||
    res1.netQuantity.value?.numericValue !== 400 ||
    res1.dates.value?.dateOfManufacture?.dateString !== '01/2026' ||
    res1.countryOfOrigin.value?.countryName !== 'India'
  ) {
    throw new Error('Test 1 failed to extract standard FMCG declarations accurately.');
  }
  console.log('✓ Test 1 Passed.\n');

  // Test 2: Ambiguous Multiple Prices & Missing USP
  console.log('--- Test 2: Ambiguous Multiple Prices & Missing USP ---');
  const res2 = labelExtractor.extract(SAMPLE_2_COSMETICS_AMBIGUOUS_PRICES);
  console.log('MRP Status:', res2.mrp.status, `(Ambiguity: ${res2.mrp.ambiguityNotes})`);
  console.log('Candidate Prices Count:', res2.mrp.candidateValues?.length);
  console.log('USP Status:', res2.unitSalePrice.status);
  console.log('Consumer Care Phone Status:', res2.consumerCare.value?.phone ? 'Present' : 'None', 'Email:', res2.consumerCare.value?.email);

  if (
    res2.mrp.status !== 'uncertain' ||
    (res2.mrp.candidateValues?.length ?? 0) < 2 ||
    res2.unitSalePrice.status !== 'missing' ||
    res2.consumerCare.value?.phone
  ) {
    throw new Error('Test 2 failed: Expected ambiguous price status and missing USP.');
  }
  console.log('✓ Test 2 Passed: Ambiguity preserved without hallucinating missing values.\n');

  // Test 3: Imported Electronics
  console.log('--- Test 3: Imported Electronics ---');
  const res3 = labelExtractor.extract(SAMPLE_3_IMPORTED_ELECTRONICS);
  console.log('Commodity:', res3.productName.value?.genericName);
  console.log('Entity Type:', res3.manufacturerInfo.value?.entityType, 'Name:', res3.manufacturerInfo.value?.name);
  console.log('Country of Origin:', res3.countryOfOrigin.value?.countryName, `Imported: ${res3.countryOfOrigin.value?.isImported}`);
  console.log('Quantity Count:', res3.netQuantity.value?.numericValue, res3.netQuantity.value?.normalizedUnit);

  if (
    res3.countryOfOrigin.value?.countryName !== 'Vietnam' ||
    res3.countryOfOrigin.value?.isImported !== true ||
    res3.manufacturerInfo.value?.entityType !== 'IMPORTER' ||
    res3.netQuantity.value?.normalizedUnit !== 'N'
  ) {
    throw new Error('Test 3 failed to identify imported origin or unit piece count.');
  }
  console.log('✓ Test 3 Passed: Correctly classified imported item and N unit.\n');

  // Test 4: Noisy / Defective OCR
  console.log('--- Test 4: Defective OCR & Approximate Prefix ---');
  const res4 = labelExtractor.extract(SAMPLE_4_NOISY_DEFECTIVE_OCR);
  console.log('Net Qty Status:', res4.netQuantity.status, `(Approx detected: ${res4.netQuantity.value?.isApproximatePrefixDetected})`);
  console.log('MRP Status:', res4.mrp.status);
  console.log('Consumer Care Status:', res4.consumerCare.status);

  if (
    res4.mrp.status !== 'missing' ||
    res4.netQuantity.value?.isApproximatePrefixDetected !== true ||
    res4.netQuantity.status !== 'uncertain'
  ) {
    throw new Error('Test 4 failed: Did not flag approximate net quantity as uncertain or missing MRP as missing.');
  }
  console.log('✓ Test 4 Passed: Handled missing and approximate values gracefully.\n');

  console.log('=== ALL 4 EXTRACTION SUITES PASSED CLEANLY! ===');
  return true;
}

// Execute directly if called from CLI
if (process.argv[1]?.endsWith('testExtraction.ts') || process.argv[1]?.endsWith('testExtraction.js')) {
  try {
    runExtractionTests();
    process.exit(0);
  } catch (err) {
    console.error('Extraction test failure:', err);
    process.exit(1);
  }
}
