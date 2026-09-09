import type { RawOcrInput } from '@sih/shared';

export interface ComplianceTestSample {
  id: string;
  name: string;
  category: string;
  description: string;
  expectedVerdict: 'COMPLIANT' | 'NON-COMPLIANT' | 'NEEDS REVIEW';
  payload: RawOcrInput;
}

export const COMPLIANCE_TEST_SAMPLES: ComplianceTestSample[] = [
  {
    id: 'SAMPLE_COMPLIANT',
    name: '1. Compliant Sample (FMCG Oats)',
    category: 'FOOD',
    description: 'Fully compliant packaging label with all mandatory Rule 6 declarations, SI units, and tax inclusivity.',
    expectedVerdict: 'COMPLIANT',
    payload: {
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
      blocks: [
        { text: 'MRP Rs. 120.00 (inclusive of all taxes)', confidence: 96 },
        { text: 'Net Qty: 400 g', confidence: 95 },
        { text: 'USP: Rs. 0.30 / g', confidence: 94 },
        { text: 'MFD: 01/2026', confidence: 92 },
        { text: '1800-110-8899', confidence: 95 },
      ],
    },
  },
  {
    id: 'SAMPLE_MISSING_FIELDS',
    name: '2. Missing-Field Sample (Incomplete Panel)',
    category: 'FOOD',
    description: 'Scanned front label panel contains Net Quantity and MRP, but lacks manufacturer address and consumer care phone. Must NOT falsely fail.',
    expectedVerdict: 'NEEDS REVIEW',
    payload: {
      rawText: `Golden Grain Premium Flour
Generic Name: Whole Wheat Atta
Net Qty: 5 kg
MRP Rs. 260.00 (inclusive of all taxes)
USP: Rs. 52.00 / kg
MFD: 02/2026`,
      pdpDimensions: { heightMm: 320, widthMm: 210, areaSqCm: 672 },
      ocrProvider: 'PaddleOCR (Front Panel Scan)',
      blocks: [
        { text: 'Net Qty: 5 kg', confidence: 94 },
        { text: 'MRP Rs. 260.00 (inclusive of all taxes)', confidence: 95 },
      ],
    },
  },
  {
    id: 'SAMPLE_UNCERTAIN_OCR',
    name: '3. Uncertain OCR Sample (Ambiguous Multi-Price)',
    category: 'COSMETICS',
    description: 'Packaging label has dual/ambiguous price stickers (MRP Rs. 499 vs Special Offer Rs. 449) and partial address without postal PIN. Must clearly display UNCERTAIN.',
    expectedVerdict: 'NEEDS REVIEW',
    payload: {
      rawText: `AuraBotanics Sunscreen SPF 50
Generic Name: Sunscreen Lotion
Manufactured By: Aura Botanics India Ltd, Solan, Himachal Pradesh
Net Qty: 100 ml
MFD: 12/2025
MRP Rs. 499.00 (inclusive of all taxes)
Special Promotional Offer MRP Rs. 449.00 (inclusive of all taxes)
USP: Rs. 4.99 / ml
Customer Helpline: 1800-220-4040 Email: care@aurabotanics.com`,
      pdpDimensions: { heightMm: 140, widthMm: 65, areaSqCm: 91 },
      ocrProvider: 'Tesseract OCR (Fuzzy Retail Stickers)',
      blocks: [
        { text: 'MRP Rs. 499.00', confidence: 68 },
        { text: 'MRP Rs. 449.00', confidence: 62 },
        { text: 'Aura Botanics India Ltd', confidence: 74 },
      ],
    },
  },
  {
    id: 'SAMPLE_CONFIRMED_VIOLATION',
    name: '4. Confirmed Non-Compliant Sample (Rule 12 & Tax Violations)',
    category: 'FOOD',
    description: 'Affirmative violations: Prohibited approximate modifier "approx when packed" (Rule 12) + MRP missing "inclusive of all taxes" (Rule 6(1)(e)) + missing phone helpline.',
    expectedVerdict: 'NON-COMPLIANT',
    payload: {
      rawText: `Crunchy Spicy Corn Puffs
Generic Name: Corn Snacks
Manufactured By: Snack Foods Ltd, Jaipur, Rajasthan - 302001
Net Weight: 250 g (approx when packed)
MFD: 01/2026
MRP Rs. 50.00
For complaints email: contact@snackfoods.com`,
      pdpDimensions: { heightMm: 220, widthMm: 150, areaSqCm: 330 },
      ocrProvider: 'Cloud Vision OCR',
      blocks: [
        { text: 'Net Weight: 250 g (approx when packed)', confidence: 92 },
        { text: 'MRP Rs. 50.00', confidence: 94 },
      ],
    },
  },
];
