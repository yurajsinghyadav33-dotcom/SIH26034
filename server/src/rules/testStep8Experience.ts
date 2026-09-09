import { labelExtractor } from '../extractor/LabelExtractor.js';
import { ruleEngine } from './RuleEngine.js';

export function testStep8ComplianceExperience(): boolean {
  console.log('=== [SIH26034] STEP 8 COMPLIANCE EXPERIENCE VALIDATION ===\n');

  // Test 1: Compliant Sample
  console.log('--- Test 1: Compliant Sample Flow ---');
  const sample1 = {
    rawText: `NutriDaily Instant Masala Oats
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
Country of Origin: India`,
  };
  const ext1 = labelExtractor.extract(sample1);
  const rep1 = ruleEngine.evaluate(ext1);

  console.log('Overall Status:', rep1.overallStatus === 'COMPLIANT' ? 'COMPLIANT' : rep1.overallStatus);
  console.log(`Results: ${rep1.passedCount} Passed, ${rep1.failedCount} Failed, ${rep1.uncertainCount} Uncertain, ${rep1.notDetectedCount} Not Detected`);
  rep1.ruleResults.forEach((r) => {
    const symbol = r.status === 'PASS' ? '✅ PASS' : r.status === 'FAIL' ? '❌ FAIL' : r.status === 'UNCERTAIN' ? '⚠️ UNCERTAIN' : r.status === 'NOT_DETECTED' ? '— NOT DETECTED' : '⚪ NOT APPLICABLE';
    console.log(`  ${symbol} [${r.ruleReference}] ${r.title}`);
  });

  if (rep1.overallStatus !== 'COMPLIANT' || rep1.failedCount > 0) {
    throw new Error('Test 1 failed: Expected COMPLIANT.');
  }
  console.log('✓ Test 1 Passed.\n');

  // Test 2: Missing-Field Sample
  console.log('--- Test 2: Missing-Field Sample (Not Detected) Flow ---');
  const sample2 = {
    rawText: `Golden Grain Premium Flour
Generic Name: Whole Wheat Atta
Net Qty: 5 kg
MRP Rs. 260.00 (inclusive of all taxes)
USP: Rs. 52.00 / kg
MFD: 02/2026`,
  };
  const ext2 = labelExtractor.extract(sample2);
  const rep2 = ruleEngine.evaluate(ext2);

  const mappedStatus2 = rep2.overallStatus === 'COMPLIANT' ? 'COMPLIANT' : rep2.overallStatus === 'NON_COMPLIANT' ? 'NON-COMPLIANT' : 'NEEDS REVIEW';
  console.log('Overall Status:', mappedStatus2, `(Internal: ${rep2.overallStatus})`);
  console.log(`Results: ${rep2.passedCount} Passed, ${rep2.failedCount} Failed, ${rep2.notDetectedCount} Not Detected`);

  rep2.ruleResults.forEach((r) => {
    const symbol = r.status === 'PASS' ? '✅ PASS' : r.status === 'FAIL' ? '❌ FAIL' : r.status === 'UNCERTAIN' ? '⚠️ UNCERTAIN' : r.status === 'NOT_DETECTED' ? '— NOT DETECTED' : '⚪ NOT APPLICABLE';
    console.log(`  ${symbol} [${r.ruleReference}] ${r.title}`);
  });

  if (mappedStatus2 !== 'NEEDS REVIEW' || rep2.failedCount !== 0 || rep2.notDetectedCount === 0) {
    throw new Error('Test 2 failed: Missing fields must show NOT DETECTED and trigger NEEDS REVIEW without false FAIL.');
  }
  console.log('✓ Test 2 Passed: Missing fields correctly distinguished from violations.\n');

  // Test 3: Uncertain OCR Sample
  console.log('--- Test 3: Uncertain OCR Sample (Dual Price & Missing PIN) Flow ---');
  const sample3 = {
    rawText: `AuraBotanics Sunscreen SPF 50
Generic Name: Sunscreen Lotion
Manufactured By: Aura Botanics India Ltd, Solan, Himachal Pradesh
Net Qty: 100 ml
MFD: 12/2025
MRP Rs. 499.00 (inclusive of all taxes)
Special Promotional Offer MRP Rs. 449.00 (inclusive of all taxes)
USP: Rs. 4.99 / ml
Customer Helpline: 1800-220-4040 Email: care@aurabotanics.com`,
  };
  const ext3 = labelExtractor.extract(sample3);
  const rep3 = ruleEngine.evaluate(ext3);

  const mappedStatus3 = rep3.overallStatus === 'COMPLIANT' ? 'COMPLIANT' : rep3.overallStatus === 'NON_COMPLIANT' ? 'NON-COMPLIANT' : 'NEEDS REVIEW';
  console.log('Overall Status:', mappedStatus3, `(Internal: ${rep3.overallStatus})`);
  console.log(`Results: ${rep3.passedCount} Passed, ${rep3.failedCount} Failed, ${rep3.uncertainCount} Uncertain`);

  rep3.ruleResults.forEach((r) => {
    const symbol = r.status === 'PASS' ? '✅ PASS' : r.status === 'FAIL' ? '❌ FAIL' : r.status === 'UNCERTAIN' ? '⚠️ UNCERTAIN' : r.status === 'NOT_DETECTED' ? '— NOT DETECTED' : '⚪ NOT APPLICABLE';
    console.log(`  ${symbol} [${r.ruleReference}] ${r.title}: ${r.reason}`);
  });

  if (mappedStatus3 !== 'NEEDS REVIEW' || rep3.failedCount !== 0 || rep3.uncertainCount === 0) {
    throw new Error('Test 3 failed: Ambiguous OCR must show UNCERTAIN and trigger NEEDS REVIEW without false FAIL.');
  }
  console.log('✓ Test 3 Passed: Uncertainty preserved without inventing violations.\n');

  console.log('=== ALL STEP 8 EXPERIENCE TESTS PASSED! ===');
  return true;
}

if (process.argv[1]?.endsWith('testStep8Experience.ts') || process.argv[1]?.endsWith('testStep8Experience.js')) {
  try {
    testStep8ComplianceExperience();
    process.exit(0);
  } catch (err) {
    console.error('Step 8 Test Failure:', err);
    process.exit(1);
  }
}
