import type { CommodityCategory, ComplianceStatus, ViolationSeverity } from '@sih/shared';

export interface MockInspection {
  id: string;
  sku: string;
  productName: string;
  brand: string;
  category: CommodityCategory;
  batchNumber: string;
  dateOfManufacture: string;
  mrp: string;
  unitSalePrice: string;
  status: ComplianceStatus;
  inspectedAt: string;
  inspector: string;
  violationsCount: number;
}

export interface MockViolation {
  id: string;
  inspectionId: string;
  productName: string;
  brand: string;
  ruleClause: string;
  ruleTitle: string;
  severity: ViolationSeverity;
  status: ComplianceStatus;
  statutoryReference: string;
  detectedIssue: string;
  evidenceSnippet: string;
  remedyAction: string;
}

export interface MockRule {
  ruleId: string;
  clause: string;
  title: string;
  category: string;
  description: string;
  severity: ViolationSeverity;
  statutoryReference: string;
  isActive: boolean;
}

export const MOCK_STATS = {
  totalInspections: 1248,
  compliantCount: 1084,
  violationsCount: 126,
  underReviewCount: 38,
  complianceRate: 86.8,
  totalFinesFlaggedInr: '₹ 18,40,000',
};

export const MOCK_INSPECTIONS: MockInspection[] = [
  {
    id: 'INSP-2026-0891',
    sku: 'SKU-FMCG-8821',
    productName: 'Instant Masala Oats (400g Pouch)',
    brand: 'NutriDaily Foods',
    category: 'FOOD',
    batchNumber: 'BCH-2026-04A',
    dateOfManufacture: '01/2026',
    mrp: '₹ 120.00 (Incl. of all taxes)',
    unitSalePrice: '₹ 0.30 / g',
    status: 'COMPLIANT',
    inspectedAt: '2026-09-04 14:32',
    inspector: 'Insp. Y. S. Yadav',
    violationsCount: 0,
  },
  {
    id: 'INSP-2026-0890',
    sku: 'SKU-COSM-4419',
    productName: 'Herbal Hydration Sunscreen SPF 50',
    brand: 'AuraBotanics India',
    category: 'COSMETICS',
    batchNumber: 'AB-88910',
    dateOfManufacture: '12/2025',
    mrp: '₹ 499.00',
    unitSalePrice: 'Missing',
    status: 'NON_COMPLIANT',
    inspectedAt: '2026-09-04 11:15',
    inspector: 'Insp. R. Sharma',
    violationsCount: 2,
  },
  {
    id: 'INSP-2026-0889',
    sku: 'SKU-FOOD-1033',
    productName: 'Refined Sunflower Oil (1 Litre Tetra)',
    brand: 'Surya Gold Agro',
    category: 'FOOD',
    batchNumber: 'SG-22019',
    dateOfManufacture: '02/2026',
    mrp: '₹ 145.00 (Incl. of all taxes)',
    unitSalePrice: '₹ 145.00 / l',
    status: 'FLAGGED',
    inspectedAt: '2026-09-03 16:45',
    inspector: 'Insp. Y. S. Yadav',
    violationsCount: 1,
  },
  {
    id: 'INSP-2026-0888',
    sku: 'SKU-ELEC-7712',
    productName: 'Wireless Bluetooth Earbuds Pro',
    brand: 'SonicWave Tech',
    category: 'ELECTRONICS',
    batchNumber: 'SW-PRO-09',
    dateOfManufacture: '01/2026',
    mrp: '₹ 1,899.00 (Incl. of all taxes)',
    unitSalePrice: '₹ 1,899.00 / N',
    status: 'COMPLIANT',
    inspectedAt: '2026-09-03 09:20',
    inspector: 'Insp. S. Verma',
    violationsCount: 0,
  },
];

export const MOCK_VIOLATIONS: MockViolation[] = [
  {
    id: 'VIOL-2026-0042',
    inspectionId: 'INSP-2026-0890',
    productName: 'Herbal Hydration Sunscreen SPF 50',
    brand: 'AuraBotanics India',
    ruleClause: 'Rule 6(11)',
    ruleTitle: 'Mandatory Unit Sale Price (USP) Missing',
    severity: 'CRITICAL',
    status: 'NON_COMPLIANT',
    statutoryReference: 'Legal Metrology (Packaged Commodities) Amendment Rules, 2021',
    detectedIssue: 'Packaged item specifies MRP of ₹ 499.00 but omits mandatory Unit Sale Price declaration (e.g. ₹ / ml).',
    evidenceSnippet: '"MRP Rs. 499.00 (Inclusive of all taxes)" [No unit price found on PDP]',
    remedyAction: 'Issue statutory notice under Section 36 of Legal Metrology Act, 2009 for penalty compounded.',
  },
  {
    id: 'VIOL-2026-0041',
    inspectionId: 'INSP-2026-0890',
    productName: 'Herbal Hydration Sunscreen SPF 50',
    brand: 'AuraBotanics India',
    ruleClause: 'Rule 6(1)(n)',
    ruleTitle: 'Incomplete Consumer Care Address',
    severity: 'MAJOR',
    status: 'NON_COMPLIANT',
    statutoryReference: 'Rule 6(1)(n) of LMR, 2011',
    detectedIssue: 'Only email is provided; statutory telephone helpline number is missing from package.',
    evidenceSnippet: '"For complaints: contact@aurabotanics.com" [Helpline phone absent]',
    remedyAction: 'Mandate packaging correction with toll-free/telephone number before distribution.',
  },
  {
    id: 'VIOL-2026-0040',
    inspectionId: 'INSP-2026-0889',
    productName: 'Refined Sunflower Oil (1 Litre Tetra)',
    brand: 'Surya Gold Agro',
    ruleClause: 'Rule 7, Table 1',
    ruleTitle: 'Net Quantity Font Height Below Threshold',
    severity: 'MAJOR',
    status: 'FLAGGED',
    statutoryReference: 'Rule 7(1) read with Table-1 (Minimum height of numerals)',
    detectedIssue: 'For PDP area > 500 cm², net quantity numeral height must be >= 4 mm. Detected numeral height is 2.8 mm.',
    evidenceSnippet: '"Net Qty: 1 L" [Bounding height: 2.8 mm, required: 4.0 mm]',
    remedyAction: 'Flagged for manual physical micrometer verification by Enforcement Officer.',
  },
];

export const MOCK_RULES: MockRule[] = [
  {
    ruleId: 'LMR_R6_1_A',
    clause: 'Rule 6(1)(a)',
    title: 'Manufacturer / Packer / Importer Name & Address',
    category: 'Identity',
    description: 'Every package shall bear the name and complete address of the manufacturer or packer or importer.',
    severity: 'CRITICAL',
    statutoryReference: 'LMR 2011, Rule 6(1)(a)',
    isActive: true,
  },
  {
    ruleId: 'LMR_R6_1_B',
    clause: 'Rule 6(1)(b)',
    title: 'Generic or Common Name of Commodity',
    category: 'Description',
    description: 'The common or generic names of the commodity contained in the package shall be legibly declared.',
    severity: 'MAJOR',
    statutoryReference: 'LMR 2011, Rule 6(1)(b)',
    isActive: true,
  },
  {
    ruleId: 'LMR_R6_1_C',
    clause: 'Rule 6(1)(c) & Rule 11',
    title: 'Net Quantity in Standard SI Units',
    category: 'Quantity',
    description: 'Net quantity in terms of standard unit of weight, measure or number (g, kg, ml, l, N). Symbols must conform strictly to Rule 11.',
    severity: 'CRITICAL',
    statutoryReference: 'LMR 2011, Rule 6(1)(c) & Second Schedule',
    isActive: true,
  },
  {
    ruleId: 'LMR_R6_1_D',
    clause: 'Rule 6(1)(d)',
    title: 'Month and Year of Manufacture / Packing / Import',
    category: 'Dates',
    description: 'The month and year in which the commodity is manufactured or packed or imported shall be clearly stated.',
    severity: 'CRITICAL',
    statutoryReference: 'LMR 2011, Rule 6(1)(d)',
    isActive: true,
  },
  {
    ruleId: 'LMR_R6_1_E',
    clause: 'Rule 6(1)(e)',
    title: 'Maximum Retail Price (MRP) & Tax Inclusivity',
    category: 'Pricing',
    description: 'Retail sale price shall be stated as "Maximum or Max. Retail Price ... incl. of all taxes" or "MRP Rs. ... incl. of all taxes". Rounding to nearest rupee/paisa.',
    severity: 'CRITICAL',
    statutoryReference: 'LMR 2011, Rule 6(1)(e)',
    isActive: true,
  },
  {
    ruleId: 'LMR_R6_11',
    clause: 'Rule 6(11)',
    title: 'Unit Sale Price (USP) for Pre-packaged Commodities',
    category: 'Pricing',
    description: 'Unit sale price in rupees rounded off to nearest two decimal places per g/ml or per kg/litre or per piece.',
    severity: 'CRITICAL',
    statutoryReference: 'LMR Amendment Rules 2021, Rule 6(11)',
    isActive: true,
  },
  {
    ruleId: 'LMR_R6_1_N',
    clause: 'Rule 6(1)(n)',
    title: 'Consumer Care Contact Details',
    category: 'Consumer Redressal',
    description: 'Name, address, telephone number and email address of person/office to be contacted in case of consumer complaints.',
    severity: 'CRITICAL',
    statutoryReference: 'LMR 2011, Rule 6(1)(n)',
    isActive: true,
  },
  {
    ruleId: 'LMR_R7_TABLE1',
    clause: 'Rule 7, Table 1',
    title: 'Minimum Font & Numeral Height based on PDP Area',
    category: 'Typography',
    description: 'Minimum height of numerals and letters based on Principal Display Panel (PDP) area as per Table 1.',
    severity: 'MAJOR',
    statutoryReference: 'LMR 2011, Rule 7 & Table 1',
    isActive: true,
  },
];
