/**
 * SIH26034 - Legal Metrology Barcode & GS1 Intelligence System
 * Standards: GS1 General Specifications & Legal Metrology (Packaged Commodities) Rules, 2011
 */

export type BarcodeFormat =
  | 'EAN-13'
  | 'UPC-A'
  | 'EAN-8'
  | 'CODE-128'
  | 'GS1-128'
  | 'QR_CODE'
  | 'DATA_MATRIX'
  | 'UNKNOWN';

export type BarcodeValidationStatus =
  | 'VALID'
  | 'INVALID_CHECKSUM'
  | 'INVALID_FORMAT'
  | 'UNREGISTERED_PREFIX';

export interface BarcodeRuleConformity {
  rule6_1_a_ManufacturerMatch: 'PASS' | 'WARNING' | 'NOT_APPLICABLE';
  rule6_1_g_OriginMatch: 'PASS' | 'WARNING' | 'NOT_APPLICABLE';
  statutoryVerdict: 'COMPLIANT' | 'NEEDS_REVIEW' | 'INVALID';
  explanation: string;
  notes: string[];
}

export interface BarcodeIntelligenceResult {
  barcode: string;
  format: BarcodeFormat;
  isValidChecksum: boolean;
  validationStatus: BarcodeValidationStatus;
  countryPrefix: string;
  countryName: string;
  isIndianOrigin: boolean;
  companyPrefix: string;
  registeredEntity: string;
  productClassification: string;
  identifiedProductName: string;
  checkDigit: number;
  calculatedCheckDigit: number;
  ruleConformity: BarcodeRuleConformity;
}
