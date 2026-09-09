/**
 * SIH26034 - Legal Metrology Database Entity Contracts
 * Shared across server and client for strict type consistency
 */

import type { UserRole, CommodityCategory, ComplianceStatus, ViolationSeverity, MandatoryDeclarationKey } from './index.js';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PdpDimensions {
  heightMm: number;
  widthMm: number;
  areaSqCm: number;
}

// 1. User Entity
export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  badgeNumber?: string;
  jurisdiction?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 2. Product Entity
export interface IProduct {
  id: string;
  sku: string;
  barcode?: string;
  productName: string;
  brand: string;
  manufacturerName: string;
  manufacturerAddress: string;
  category: CommodityCategory;
  standardNetQuantity?: {
    value: number;
    unit: string;
  };
  pdpDimensions?: PdpDimensions;
  registeredBy: string; // User ID
  inspectionCount: number;
  lastInspectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 3. Scan Entity
export type SurfaceType = 'FRONT' | 'BACK' | 'SIDE' | 'MRP_LABEL' | 'BOTTOM' | 'TOP';

export interface IScan {
  id: string;
  scanId: string;
  inspectionId: string;
  productId?: string;
  imageUrl: string;
  imageHash: string; // SHA-256 for legal tamper-evidence
  surfaceType: SurfaceType;
  pdpAreaPercentage?: number;
  ocrRawText?: string;
  ocrBlocks?: Array<{
    text: string;
    confidence?: number;
    boundingBox?: BoundingBox;
  }>;
  ocrProvider: string;
  processingStatus?: 'PENDING' | 'COMPLETED' | 'FAILED';
  capturedBy: string; // User ID
  createdAt: string;
  updatedAt: string;
}

// 4. ExtractedDeclaration Entity
export interface IExtractedDeclaration {
  id: string;
  scanId: string;
  inspectionId: string;
  declarationKey: MandatoryDeclarationKey;
  rawValue: string;
  normalizedValue?: unknown;
  confidenceScore: number; // 0 - 100
  boundingBox?: BoundingBox;
  estimatedFontHeightMm?: number;
  isVerifiedByInspector: boolean;
  inspectorNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// 5. Rule Entity
export interface IRule {
  id: string;
  ruleId: string;
  version: string; // e.g. "2011.1"
  clause: string;
  title: string;
  category: string;
  description: string;
  statutoryReference: string;
  severity: ViolationSeverity;
  parameters?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 6. Inspection Entity
export type InspectionProcessingStatus = 'PENDING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';

export interface IInspection {
  id: string;
  inspectionId: string; // e.g. "INSP-2026-0891"
  productId: string;
  inspectorId: string;
  reviewerId?: string;
  batchNumber: string;
  dateOfManufacture: string;
  mrpDeclared: string;
  unitSalePriceDeclared?: string;
  category: CommodityCategory;
  overallStatus: ComplianceStatus | 'FLAGGED_FOR_REVIEW' | 'INCOMPLETE_DATA';
  processingStatus: InspectionProcessingStatus;
  totalViolations: number;
  criticalViolations: number;
  ruleVersionUsed: string;
  inspectedAt: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 7. ComplianceResult Entity
export interface IComplianceResult {
  id: string;
  inspectionId: string;
  ruleId: string;
  ruleVersion: string;
  status: string; // 'PASS' | 'FAIL' | 'NOT_APPLICABLE' | 'UNCERTAIN' | 'NOT_DETECTED'
  statutoryClause: string;
  statutoryReason: string;
  evidenceSummary: string;
  evidence?: Record<string, unknown>;
  suggestedRemedy?: string;
  createdAt: string;
  updatedAt: string;
}

// 8. Violation Entity
export type ViolationStatus = 'OPEN' | 'NOTICE_ISSUED' | 'COMPOUNDED' | 'RESOLVED' | 'DISMISSED';

export interface IViolation {
  id: string;
  violationId: string; // e.g. "VIOL-2026-0042"
  inspectionId: string;
  complianceResultId: string;
  productId: string;
  ruleId: string;
  clause: string;
  severity: ViolationSeverity;
  detectedIssue: string;
  status: ViolationStatus;
  penaltySection: string;
  estimatedFineInr?: number;
  createdAt: string;
  updatedAt: string;
}

// 9. Evidence Entity
export type EvidenceType = 'CROPPED_DECLARATION' | 'FULL_PACKAGING' | 'OCR_TRANSCRIPT' | 'MEASUREMENT_OVERLAY';

export interface IEvidence {
  id: string;
  evidenceId: string; // e.g. "EVD-2026-01"
  violationId: string;
  inspectionId: string;
  scanId: string;
  evidenceType: EvidenceType;
  fileUrl: string;
  fileHash: string; // SHA-256 for court-admissible audit integrity
  boundingBox?: BoundingBox;
  detectedSnippet: string;
  statutoryCitation: string;
  createdAt: string;
  updatedAt: string;
}

// 10. Report Entity
export type ReportType = 'INSPECTION_CERTIFICATE' | 'SECTION_36_NOTICE' | 'COMPOUNDING_ORDER' | 'ZONAL_AUDIT_SUMMARY';
export type ReportStatus = 'DRAFT' | 'ISSUED' | 'DISPATCHED' | 'ACCEPTED';

export interface IReport {
  id: string;
  reportId: string;
  reportType: ReportType;
  inspectionId?: string;
  issuedToBrand?: string;
  issuedToManufacturer?: string;
  generatedBy: string; // User ID
  signedByInspector?: string;
  pdfUrl?: string;
  digitalChecksum?: string;
  status: ReportStatus;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}

// 11. AuditLog Entity
export type AuditAction =
  | 'INSPECTION_CREATED'
  | 'VIOLATION_FLAGGED'
  | 'MANUAL_OVERRIDE'
  | 'STATUS_CHANGED'
  | 'NOTICE_GENERATED'
  | 'RULE_UPDATED';

export interface IAuditLog {
  id: string;
  auditId: string;
  action: AuditAction;
  entityType: 'INSPECTION' | 'VIOLATION' | 'PRODUCT' | 'RULE' | 'REPORT';
  entityId: string;
  userId: string;
  previousState?: unknown;
  newState?: unknown;
  justification?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  createdAt: string;
}
