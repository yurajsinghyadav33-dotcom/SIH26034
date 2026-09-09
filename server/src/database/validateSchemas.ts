import mongoose from 'mongoose';
import {
  UserModel,
  ProductModel,
  ScanModel,
  ExtractedDeclarationModel,
  RuleModel,
  InspectionModel,
  ComplianceResultModel,
  ViolationModel,
  EvidenceModel,
  ReportModel,
  AuditLogModel,
} from './models/index.js';

export async function validateAllSchemas(): Promise<{ success: boolean; validatedCount: number }> {
  const dummyUserId = new mongoose.Types.ObjectId();
  const dummyProductId = new mongoose.Types.ObjectId();
  const dummyInspectionId = new mongoose.Types.ObjectId();
  const dummyScanId = new mongoose.Types.ObjectId();
  const dummyComplianceResultId = new mongoose.Types.ObjectId();
  const dummyViolationId = new mongoose.Types.ObjectId();

  // 1. User
  const user = new UserModel({
    name: 'Inspector Y. S. Yadav',
    email: 'inspector@legalmetrology.gov.in',
    passwordHash: 'hashed_password_sample_2026',
    role: 'ENFORCEMENT_INSPECTOR',
    department: 'Zonal Enforcement Wing',
    badgeNumber: 'LMO-ND-402',
    jurisdiction: 'Northern Regional Zone',
    isActive: true,
  });
  await user.validate();

  // 2. Product
  const product = new ProductModel({
    sku: 'SKU-FMCG-8821',
    barcode: '8901030882104',
    productName: 'Instant Masala Oats (400g Pouch)',
    brand: 'NutriDaily Foods',
    manufacturerName: 'NutriDaily Foods Pvt Ltd',
    manufacturerAddress: 'Plot 44, Udyog Vihar, Gurugram, Haryana - 122016',
    category: 'FOOD',
    standardNetQuantity: { value: 400, unit: 'g' },
    pdpDimensions: { heightMm: 185, widthMm: 120, areaSqCm: 222 },
    registeredBy: dummyUserId,
    inspectionCount: 1,
    lastInspectedAt: new Date(),
  });
  await product.validate();

  // 3. Scan
  const scan = new ScanModel({
    scanId: 'SCN-2026-001',
    inspectionId: dummyInspectionId,
    productId: dummyProductId,
    imageUrl: 'https://storage.local/uploads/pouch_front.jpg',
    imageHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    surfaceType: 'FRONT',
    pdpAreaPercentage: 42.5,
    ocrRawText: 'NutriDaily Instant Oats MRP Rs 120.00 incl of all taxes',
    ocrProvider: 'mock',
    capturedBy: dummyUserId,
  });
  await scan.validate();

  // 4. ExtractedDeclaration
  const declaration = new ExtractedDeclarationModel({
    scanId: dummyScanId,
    inspectionId: dummyInspectionId,
    declarationKey: 'mrp',
    rawValue: 'MRP Rs. 120.00 (incl. of all taxes)',
    normalizedValue: { amount: 120.0, currency: 'INR', taxInclusive: true },
    confidenceScore: 98.5,
    boundingBox: { x: 120, y: 340, width: 250, height: 45 },
    estimatedFontHeightMm: 4.2,
    isVerifiedByInspector: true,
    inspectorNotes: 'Compliant with Rule 6(1)(e)',
  });
  await declaration.validate();

  // 5. Rule
  const rule = new RuleModel({
    ruleId: 'LMR_R6_1_E_MRP',
    version: '2011.1',
    clause: 'Rule 6(1)(e)',
    title: 'Retail Sale Price Declaration',
    category: 'Pricing',
    description: 'Every package shall bear Maximum Retail Price inclusive of all taxes.',
    statutoryReference: 'Legal Metrology (Packaged Commodities) Rules, 2011, Rule 6(1)(e)',
    severity: 'CRITICAL',
    parameters: { taxInclusivityMandatory: true },
    isActive: true,
  });
  await rule.validate();

  // 6. Inspection
  const inspection = new InspectionModel({
    inspectionId: 'INSP-2026-0891',
    productId: dummyProductId,
    inspectorId: dummyUserId,
    batchNumber: 'BCH-2026-04A',
    dateOfManufacture: '01/2026',
    mrpDeclared: '₹ 120.00 (Incl. of all taxes)',
    unitSalePriceDeclared: '₹ 0.30 / g',
    category: 'FOOD',
    overallStatus: 'COMPLIANT',
    totalViolations: 0,
    criticalViolations: 0,
    ruleVersionUsed: '2011.1',
    inspectedAt: new Date(),
  });
  await inspection.validate();

  // 7. ComplianceResult
  const complianceResult = new ComplianceResultModel({
    inspectionId: dummyInspectionId,
    ruleId: 'LMR_R6_1_E_MRP',
    ruleVersion: '2011.1',
    status: 'COMPLIANT',
    statutoryClause: 'Rule 6(1)(e)',
    statutoryReason: 'MRP is declared and clearly indicates inclusive of all taxes.',
    evidenceSummary: 'Extracted: "MRP Rs. 120.00 (incl. of all taxes)"',
  });
  await complianceResult.validate();

  // 8. Violation
  const violation = new ViolationModel({
    violationId: 'VIOL-2026-0042',
    inspectionId: dummyInspectionId,
    complianceResultId: dummyComplianceResultId,
    productId: dummyProductId,
    ruleId: 'LMR_R6_11_USP',
    clause: 'Rule 6(11)',
    severity: 'CRITICAL',
    detectedIssue: 'Mandatory Unit Sale Price missing on package.',
    status: 'OPEN',
    penaltySection: 'Section 36 of Legal Metrology Act, 2009',
    estimatedFineInr: 25000,
  });
  await violation.validate();

  // 9. Evidence
  const evidence = new EvidenceModel({
    evidenceId: 'EVD-2026-001',
    violationId: dummyViolationId,
    inspectionId: dummyInspectionId,
    scanId: dummyScanId,
    evidenceType: 'CROPPED_DECLARATION',
    fileUrl: 'https://storage.local/evidence/evd_001.png',
    fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    boundingBox: { x: 10, y: 20, width: 100, height: 30 },
    detectedSnippet: 'MRP Rs. 499.00 [No USP found]',
    statutoryCitation: 'LMR 2011 Rule 6(11)',
  });
  await evidence.validate();

  // 10. Report
  const report = new ReportModel({
    reportId: 'RPT-2026-0042',
    reportType: 'INSPECTION_CERTIFICATE',
    inspectionId: dummyInspectionId,
    issuedToBrand: 'NutriDaily Foods',
    issuedToManufacturer: 'NutriDaily Foods Pvt Ltd',
    generatedBy: dummyUserId,
    signedByInspector: 'Insp. Y. S. Yadav',
    pdfUrl: 'https://storage.local/reports/rpt_0042.pdf',
    digitalChecksum: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
    status: 'ISSUED',
    generatedAt: new Date(),
  });
  await report.validate();

  // 11. AuditLog
  const auditLog = new AuditLogModel({
    auditId: 'AUD-2026-0001',
    action: 'INSPECTION_CREATED',
    entityType: 'INSPECTION',
    entityId: 'INSP-2026-0891',
    userId: dummyUserId,
    previousState: null,
    newState: { status: 'COMPLIANT' },
    justification: 'Automated evaluation completed under Legal Metrology Rules 2011.',
    ipAddress: '127.0.0.1',
    userAgent: 'EnforcementPortal/1.0',
    timestamp: new Date(),
  });
  await auditLog.validate();

  return { success: true, validatedCount: 11 };
}

// Execute directly if run via node/tsx
if (process.argv[1]?.endsWith('validateSchemas.ts') || process.argv[1]?.endsWith('validateSchemas.js')) {
  validateAllSchemas()
    .then((res) => {
      console.log(`[Schema Validation] SUCCESS: All ${res.validatedCount} Legal Metrology database schemas validated cleanly!`);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Schema Validation] FAILED:', err);
      process.exit(1);
    });
}
