import { labelExtractor } from '../extractor/LabelExtractor.js';
import { ruleEngine } from './RuleEngine.js';
import type { RawOcrInput, NormalizedCommodityExtraction } from '@sih/shared';

export function runRuleEngineTests(): boolean {
  console.log('=== [SIH26034] STARTING LEGAL METROLOGY RULE ENGINE TESTS ===\n');

  // -------------------------------------------------------------
  // Test 1: Fully Compliant FMCG Food Package
  // -------------------------------------------------------------
  console.log('--- Test 1: Fully Compliant FMCG Food Package ---');
  const ocr1: RawOcrInput = {
    rawText: `
      NutriDaily Instant Masala Oats
      Generic Name: Instant Rolled Oats with Spices
      Manufactured & Packed By: NutriDaily Foods Pvt Ltd, Plot 44, Udyog Vihar, Gurugram, Haryana - 122016
      Net Qty: 400 g
      MFD: 01/2026
      EXP: 01/2027
      Batch No: BCH-2026-04A
      MRP Rs. 120.00 (inclusive of all taxes)
      USP: Rs. 0.30 / g
      Customer Helpline Toll-Free: 1800-110-8899 Email: feedback@nutridaily.com
      Consumer Care Manager, NutriDaily Foods, Gurugram
    `,
  };
  const ext1 = labelExtractor.extract(ocr1);
  const report1 = ruleEngine.evaluate(ext1);

  console.log('Overall Compliance Status:', report1.overallStatus);
  console.log(`Summary: Passed: ${report1.passedCount}, Failed: ${report1.failedCount}, Uncertain: ${report1.uncertainCount}, Not Detected: ${report1.notDetectedCount}, Not Applicable: ${report1.notApplicableCount}`);
  report1.ruleResults.filter(r => r.status === 'FAIL').forEach(f => console.log('FAILED RULE in Test 1:', f.ruleReference, f.reason));
  
  // Verify Rule 6(1)(g) Country of origin is NOT_APPLICABLE for domestic item
  const originResult = report1.ruleResults.find((r) => r.ruleId === 'LMR_2011_R6_1_G_COUNTRY_OF_ORIGIN');
  console.log('Domestic Country of Origin Rule Status:', originResult?.status, `(${originResult?.reason})`);

  if (report1.overallStatus !== 'COMPLIANT' || report1.failedCount !== 0 || originResult?.status !== 'NOT_APPLICABLE') {
    throw new Error('Test 1 failed: Expected fully COMPLIANT status for compliant FMCG package.');
  }
  console.log('✓ Test 1 Passed.\n');

  // -------------------------------------------------------------
  // Test 2: Affirmative Non-Compliance (Missing Taxes & Missing Phone)
  // -------------------------------------------------------------
  console.log('--- Test 2: Affirmative Non-Compliance (Rule 6(1)(e) & Rule 6(1)(n)) ---');
  const ocr2: RawOcrInput = {
    rawText: `
      AuraBotanics Sunscreen Lotion
      Generic Name: Sunscreen SPF 50
      Manufactured By: Aura Botanics India Ltd, Solan, HP - 173205
      Net Qty: 100 ml
      MFD: 01/2026
      MRP Rs. 499.00
      For complaints email: contact@aurabotanics.com
    `,
  };
  const ext2 = labelExtractor.extract(ocr2);
  const report2 = ruleEngine.evaluate(ext2);

  console.log('Overall Compliance Status:', report2.overallStatus);
  console.log('Failed Rules Count:', report2.failedCount);
  report2.ruleResults
    .filter((r) => r.status === 'FAIL')
    .forEach((f) => {
      console.log(`  -> FAIL [${f.ruleReference}] ${f.title}: ${f.reason}`);
    });

  const mrpFail = report2.ruleResults.find((r) => r.ruleId === 'LMR_2011_R6_1_E_MRP');
  const phoneFail = report2.ruleResults.find((r) => r.ruleId === 'LMR_2011_R6_1_N_CONSUMER_CARE');

  if (report2.overallStatus !== 'NON_COMPLIANT' || mrpFail?.status !== 'FAIL' || phoneFail?.status !== 'FAIL') {
    throw new Error('Test 2 failed: Expected NON_COMPLIANT status with MRP tax and Phone violations.');
  }
  console.log('✓ Test 2 Passed: Correctly flagged affirmative statutory violations.\n');

  // -------------------------------------------------------------
  // Test 3: Prohibited Approximate Modifier (Rule 12 Violation)
  // -------------------------------------------------------------
  console.log('--- Test 3: Prohibited Approximate Modifier (Rule 12 Violation) ---');
  const ocr3: RawOcrInput = {
    rawText: `
      Crunchy Snack Bites
      Generic Name: Roasted Corn Crisps
      Manufactured By: Snack Foods India Ltd, Jaipur, Rajasthan - 302001
      Net Weight: 250 g (approx when packed)
      MFD: 02/2026
      MRP Rs. 50.00 (incl. of all taxes)
      USP: Rs. 0.20 / g
      Helpline: 1800-444-5555 Email: care@crunchysnacks.in
    `,
  };
  const ext3 = labelExtractor.extract(ocr3);
  const report3 = ruleEngine.evaluate(ext3);

  const netQtyResult = report3.ruleResults.find((r) => r.ruleId === 'LMR_2011_R6_1_C_NET_QUANTITY');
  console.log('Net Quantity Rule Status:', netQtyResult?.status, `[${netQtyResult?.statutoryReference}]`);
  console.log('Reason:', netQtyResult?.reason);

  if (netQtyResult?.status !== 'FAIL' || !netQtyResult.reason.includes('Rule 12')) {
    throw new Error('Test 3 failed: Expected Rule 12 approximate modifier violation.');
  }
  console.log('✓ Test 3 Passed: Prohibited approximate prefix correctly failed under Rule 12.\n');

  // -------------------------------------------------------------
  // Test 4: Temporal Safety & Single-Piece Exemption (Rule 6(11))
  // -------------------------------------------------------------
  console.log('--- Test 4: Single Piece Exemption under Rule 6(11) Proviso ---');
  const ocr4: RawOcrInput = {
    rawText: `
      SonicWave Wireless Earbuds Pro
      Generic Name: Bluetooth Wireless Earphones
      Imported By: SonicWave Tech India Pvt Ltd, Andheri East, Mumbai, Maharashtra - 400069
      Country of Origin: Vietnam
      Quantity: 1 N
      Date of Import: 02/2026
      MRP: ₹ 1,899.00 (inclusive of all taxes)
      Customer Care Helpline: 022-28499201 Email: support@sonicwave.in
    `,
  };
  const ext4 = labelExtractor.extract(ocr4);
  const report4 = ruleEngine.evaluate(ext4);

  const uspResult = report4.ruleResults.find((r) => r.ruleId === 'LMR_2021_R6_11_UNIT_SALE_PRICE');
  const originRes = report4.ruleResults.find((r) => r.ruleId === 'LMR_2011_R6_1_G_COUNTRY_OF_ORIGIN');

  console.log('USP Status (1 N Piece):', uspResult?.status, `(${uspResult?.reason})`);
  console.log('Country of Origin Status (Imported):', originRes?.status, `(${originRes?.reason})`);
  console.log('Overall Status:', report4.overallStatus);

  if (uspResult?.status !== 'PASS' || originRes?.status !== 'PASS' || report4.overallStatus !== 'COMPLIANT') {
    throw new Error('Test 4 failed: Single piece proviso or country of origin failed unexpectedly.');
  }
  console.log('✓ Test 4 Passed: Handled 1 N piece proviso and imported origin correctly.\n');

  // -------------------------------------------------------------
  // Test 5: Incomplete Label Scan (NOT_DETECTED != FAIL)
  // -------------------------------------------------------------
  console.log('--- Test 5: Incomplete Label Scan (NOT_DETECTED distinction) ---');
  const ocr5: RawOcrInput = {
    rawText: `
      Generic Name: Mixed Grain Flour
      Net Qty: 1 kg
      MRP Rs. 200.00 (inclusive of all taxes)
      USP: Rs. 200.00 / kg
    `,
  };
  const ext5 = labelExtractor.extract(ocr5);
  const report5 = ruleEngine.evaluate(ext5);

  console.log('Overall Compliance Status:', report5.overallStatus);
  console.log(`Failed Count: ${report5.failedCount}, Not Detected Count: ${report5.notDetectedCount}`);

  if (report5.overallStatus !== 'INCOMPLETE_DATA' || report5.failedCount !== 0 || report5.notDetectedCount === 0) {
    throw new Error('Test 5 failed: NOT_DETECTED must NOT automatically become FAIL.');
  }
  console.log('✓ Test 5 Passed: Incomplete scan appropriately designated as INCOMPLETE_DATA without false FAIL.\n');

  console.log('=== ALL 5 RULE ENGINE VERIFICATION SUITES PASSED! ===');
  return true;
}

// Execute directly if run via CLI
if (process.argv[1]?.endsWith('testRuleEngine.ts') || process.argv[1]?.endsWith('testRuleEngine.js')) {
  try {
    runRuleEngineTests();
    process.exit(0);
  } catch (err) {
    console.error('Rule Engine Test Failure:', err);
    process.exit(1);
  }
}
