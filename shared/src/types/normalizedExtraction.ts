/**
 * SIH26034 - Legal Metrology Extraction Layer
 * Normalized Data Contracts for Raw OCR Parsing
 */

import type { BoundingBox, PdpDimensions } from './database.js';

export type ExtractionStatus = 'detected' | 'uncertain' | 'missing';

export interface ExtractedField<T = string> {
  value: T | null;
  sourceText: string | null;
  confidence: number | null; // 0 to 100
  boundingBox?: BoundingBox;
  status: ExtractionStatus;
  ambiguityNotes?: string;
  candidateValues?: Array<{
    value: T;
    sourceText: string;
    confidence?: number;
    boundingBox?: BoundingBox;
  }>;
}

// 1. Product & Generic Name
export interface ExtractedProductName {
  genericName: string | null;
  brandName?: string | null;
  variant?: string | null;
}

// 2. Manufacturer, Packer & Importer Information
export interface ExtractedManufacturerInfo {
  entityType: 'MANUFACTURER' | 'PACKER' | 'IMPORTER' | 'MANUFACTURED_AND_PACKED_BY' | 'UNKNOWN';
  name: string | null;
  fullAddress: string | null;
  pinCode?: string | null;
  state?: string | null;
  country?: string | null;
}

// 3. Net Quantity Details
export interface ExtractedNetQuantity {
  numericValue: number | null;
  declaredUnit: string | null; // e.g. "g", "kg", "ml", "l", "N", "pieces"
  normalizedUnit: string | null; // Standardized SI metric symbol
  numberOfUnits?: number | null; // e.g. "Pack of 3" -> 3
  isApproximatePrefixDetected: boolean; // e.g., "approx", "when packed"
}

// 4. Maximum Retail Price (MRP) & Unit Sale Price
export interface ExtractedMrp {
  declaredAmount: number | null;
  currency: string | null; // "INR" or "₹" or "Rs."
  rawAmountString: string | null;
  isTaxInclusiveDeclared: boolean; // whether "inclusive of all taxes" or "incl. taxes" detected
  taxDeclarationText?: string | null;
}

export interface ExtractedUnitSalePrice {
  rate: number | null;
  unit: string | null; // e.g. "g", "ml", "kg", "l", "N"
  currency: string | null;
  rawRateString: string | null;
}

// 5. Consumer Care & Grievance Redressal
export interface ExtractedConsumerCare {
  phone?: string | null;
  email?: string | null;
  postalAddress?: string | null;
  website?: string | null;
  contactPersonDesignation?: string | null; // e.g. "Consumer Care Officer", "Manager"
}

// 6. Dates & Batch Details
export interface ExtractedDateItem {
  dateString: string;
  month?: number;
  year?: number;
  rawText: string;
}

export interface ExtractedDates {
  dateOfManufacture?: ExtractedDateItem | null;
  dateOfPackaging?: ExtractedDateItem | null;
  dateOfImport?: ExtractedDateItem | null;
  bestBeforePeriod?: string | null; // e.g. "12 months from manufacture"
  expiryDate?: ExtractedDateItem | null;
  batchOrLotNumber?: string | null;
}

// 7. Country of Origin
export interface ExtractedCountryOfOrigin {
  countryName: string | null;
  isImported: boolean;
  declarationPhrase?: string | null; // e.g., "Country of Origin: India", "Made in Vietnam"
}

// Complete Normalized Packaged Commodity Extraction Output
export interface NormalizedCommodityExtraction {
  productName: ExtractedField<ExtractedProductName>;
  manufacturerInfo: ExtractedField<ExtractedManufacturerInfo>;
  netQuantity: ExtractedField<ExtractedNetQuantity>;
  mrp: ExtractedField<ExtractedMrp>;
  unitSalePrice: ExtractedField<ExtractedUnitSalePrice>;
  consumerCare: ExtractedField<ExtractedConsumerCare>;
  countryOfOrigin: ExtractedField<ExtractedCountryOfOrigin>;
  dates: ExtractedField<ExtractedDates>;
  otherDetectedDeclarations: Array<{
    category: string;
    rawText: string;
    confidence?: number;
    boundingBox?: BoundingBox;
  }>;
  pdpDimensions?: PdpDimensions;
  metadata: {
    rawTextLength: number;
    extractedAt: string;
    extractorVersion: string;
    ocrProvider?: string;
  };
}

// Raw OCR Ingestion Format
export interface OcrTextBlock {
  text: string;
  confidence?: number;
  boundingBox?: BoundingBox;
}

export interface RawOcrInput {
  rawText: string;
  blocks?: OcrTextBlock[];
  ocrProvider?: string;
  pdpDimensions?: PdpDimensions;
}
