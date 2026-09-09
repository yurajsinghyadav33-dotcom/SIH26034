import assert from 'assert';
import { inspectionService } from './InspectionService.js';
import { validateAllSchemas } from './validateSchemas.js';

async function runTests() {
  console.log('--- TEST SUITE: SIH26034 Inspection Persistence & History ---');

  // 1. Validate All Mongoose Schemas
  console.log('[1/4] Running Mongoose Schema validation...');
  const schemaResult = await validateAllSchemas();
  assert.strictEqual(schemaResult.success, true);
  console.log(`✅ All ${schemaResult.validatedCount} schemas validated without errors.`);

  // 2. Test Compliant Product Creation
  console.log('[2/4] Testing creation of Compliant Inspection record...');
  const compliantDossier = await inspectionService.createInspection({
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
    pdpDimensions: { heightMm: 185, widthMm: 120, areaSqCm: 222 },
    ocrProvider: 'Google Vision OCR (High Confidence)',
    category: 'FOOD',
  });

  assert.ok(compliantDossier.inspection.inspectionId.startsWith('INSP-'));
  assert.strictEqual(compliantDossier.inspection.overallStatus, 'COMPLIANT');
  assert.strictEqual(compliantDossier.inspection.processingStatus, 'COMPLETED');
  assert.strictEqual(compliantDossier.inspection.totalViolations, 0);
  assert.strictEqual(compliantDossier.violations.length, 0);
  assert.ok(compliantDossier.extractedDeclarations.length >= 6);
  assert.ok(compliantDossier.complianceResults.length >= 8);
  console.log(`✅ Compliant inspection created: ${compliantDossier.inspection.inspectionId}, status: ${compliantDossier.inspection.overallStatus}`);

  // 3. Test Non-Compliant Product Creation & Violation Generation
  console.log('[3/4] Testing creation of Non-Compliant Inspection record with Section 36 Violations...');
  const nonCompliantDossier = await inspectionService.createInspection({
    rawText: `Crunchy Spicy Corn Puffs
Generic Name: Corn Snacks
Manufactured By: Snack Foods Ltd, Jaipur, Rajasthan - 302001
Net Weight: 250 g (approx when packed)
MFD: 01/2026
MRP Rs. 50.00
For complaints email: contact@snackfoods.com`,
    pdpDimensions: { heightMm: 220, widthMm: 150, areaSqCm: 330 },
    ocrProvider: 'Cloud Vision OCR',
    category: 'FOOD',
  });

  assert.strictEqual(nonCompliantDossier.inspection.overallStatus, 'NON_COMPLIANT');
  assert.ok(nonCompliantDossier.violations.length >= 2, 'Must create violations for Rule 12 and Tax inclusivity');
  for (const v of nonCompliantDossier.violations) {
    assert.strictEqual(v.penaltySection, 'Section 36 of Legal Metrology Act, 2009');
    assert.strictEqual(v.status, 'OPEN');
  }
  console.log(`✅ Non-compliant inspection created: ${nonCompliantDossier.inspection.inspectionId}, violations: ${nonCompliantDossier.violations.length}`);

  // 4. Test Listing & Read Flow with Search, Filters & Pagination
  console.log('[4/4] Testing read and search flow...');
  const listResult = await inspectionService.listInspections({
    search: 'Oats',
    status: 'COMPLIANT',
  });
  assert.ok(listResult.items.length >= 1);
  assert.ok(listResult.items[0].productName.toLowerCase().includes('oats'));

  // Test retrieval by ID
  const retrieved = await inspectionService.getInspectionById(compliantDossier.inspection.inspectionId);
  assert.ok(retrieved !== null);
  assert.strictEqual(retrieved.inspection.inspectionId, compliantDossier.inspection.inspectionId);
  assert.strictEqual(retrieved.product.productName, compliantDossier.product.productName);
  console.log(`✅ Retrieved inspection dossier by ID: ${retrieved.inspection.inspectionId}`);

  console.log('\n🌟 ALL 4 STEP 10/11 INSPECTION PERSISTENCE TESTS PASSED CLEANLY!\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
