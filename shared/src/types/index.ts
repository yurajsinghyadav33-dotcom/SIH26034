/**
 * SIH26034 - Legal Metrology (Packaged Commodities) Rules, 2011
 * Shared Domain Models & Types
 */

// User Roles for RBAC
export type UserRole = 'ADMIN' | 'ENFORCEMENT_INSPECTOR' | 'REVIEWER';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  badgeNumber?: string;
  jurisdiction?: string;
}

// Commodity Classification
export type CommodityCategory =
  | 'FOOD'
  | 'COSMETICS'
  | 'ELECTRONICS'
  | 'CHEMICAL_HOUSEHOLD'
  | 'APPAREL'
  | 'GENERAL_MERCHANDISE';

// Mandatory Legal Metrology Declarations as per Rule 6(1)
export type MandatoryDeclarationKey =
  | 'manufacturer_details'   // Rule 6(1)(a)
  | 'generic_name'           // Rule 6(1)(b)
  | 'net_quantity'           // Rule 6(1)(c) & Rule 11
  | 'date_of_manufacture'    // Rule 6(1)(d)
  | 'mrp'                    // Rule 6(1)(e)
  | 'unit_sale_price'        // Rule 6(11)
  | 'consumer_care'          // Rule 6(1)(n)
  | 'country_of_origin';     // For imported goods

// Normalized Extracted Entity from OCR
export interface ExtractedEntity {
  key: MandatoryDeclarationKey;
  label: string;
  rawValue: string;
  normalizedValue?: string | number | Record<string, unknown>;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  pdpAreaPercentage?: number;
  estimatedFontHeightMm?: number;
}

// Statutory Compliance Status
export type ComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'FLAGGED' | 'NOT_APPLICABLE';

// Severity of Rule Violation
export type ViolationSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';

// Single Rule Evaluation Result
export interface RuleEvaluationResult {
  ruleId: string;
  clause: string;
  title: string;
  severity: ViolationSeverity;
  status: ComplianceStatus;
  statutoryReference: string;
  reason: string;
  evidence: {
    declarationKey?: MandatoryDeclarationKey;
    detectedText?: string;
    expectedPattern?: string;
    minimumRequirement?: string;
    actualDetected?: string;
    coordinates?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
  suggestedRemedy?: string;
}

// Complete Inspection Summary
export interface InspectionSummary {
  id: string;
  sku: string;
  productName: string;
  brand: string;
  category: CommodityCategory;
  pdpDimensions?: {
    heightMm: number;
    widthMm: number;
    areaSqCm: number;
  };
  overallStatus: ComplianceStatus;
  totalViolations: number;
  criticalViolations: number;
  ruleVersion: string;
  evaluatedAt: string;
  inspectorId?: string;
}

// Standard API Response Structure
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
  timestamp: string;
}

export * from './barcode.js';
