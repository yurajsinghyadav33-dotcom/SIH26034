import type {
  RawOcrInput,
  NormalizedCommodityExtraction,
} from '@sih/shared';
import { extractMrp } from './parsers/extractMrp.js';
import { extractNetQuantity } from './parsers/extractNetQuantity.js';
import { extractDates } from './parsers/extractDates.js';
import { extractConsumerCare } from './parsers/extractConsumerCare.js';
import { extractManufacturer } from './parsers/extractManufacturer.js';
import { extractCountryOfOrigin } from './parsers/extractCountryOfOrigin.js';
import { extractProductName } from './parsers/extractProductName.js';

export class LabelExtractor {
  public static readonly VERSION = '1.0.0-extractor';

  /**
   * Converts raw OCR text and bounding blocks into structured, normalized
   * packaged-commodity information. Does NOT evaluate legal compliance.
   */
  public extract(input: RawOcrInput): NormalizedCommodityExtraction {
    const rawText = input.rawText || '';
    const blocks = input.blocks || [];

    // 1. Extract MRP and Unit Sale Price
    const { mrpField, uspField } = extractMrp(rawText, blocks);

    // 2. Extract Net Quantity
    const netQtyField = extractNetQuantity(rawText, blocks);

    // 3. Extract Dates (Mfg, Pkd, Exp, Best Before, Batch)
    const datesField = extractDates(rawText, blocks);

    // 4. Extract Consumer Care details
    const consumerCareField = extractConsumerCare(rawText, blocks);

    // 5. Extract Manufacturer / Packer / Importer details
    const manufacturerField = extractManufacturer(rawText, blocks);

    // 6. Extract Country of Origin
    const countryOriginField = extractCountryOfOrigin(rawText, blocks);

    // 7. Extract Product Name / Generic description
    const productNameField = extractProductName(rawText, blocks);

    // 8. Extract auxiliary label declarations (e.g. storage, ingredients, certifications)
    const otherDeclarations: NormalizedCommodityExtraction['otherDetectedDeclarations'] = [];

    // Storage Instructions
    const storageRegex = /(?:STORE\s+IN\s+A\s+(?:COOL|DRY)\s+PLACE|KEEP\s+REFRIGERATED|DO\s+NOT\s+FREEZE)[^\n\r]*/i;
    const storageMatch = storageRegex.exec(rawText);
    if (storageMatch) {
      otherDeclarations.push({
        category: 'STORAGE_INSTRUCTIONS',
        rawText: storageMatch[0].trim(),
      });
    }

    // Vegetarian / Food Symbol text
    const vegRegex = /(?:100%\s+VEGETARIAN|GREEN\s+DOT|NON[- ]VEGETARIAN)/i;
    const vegMatch = vegRegex.exec(rawText);
    if (vegMatch) {
      otherDeclarations.push({
        category: 'DIETARY_DECLARATION',
        rawText: vegMatch[0].trim(),
      });
    }

    // Assemble Normalized Extraction Payload
    return {
      productName: productNameField,
      manufacturerInfo: manufacturerField,
      netQuantity: netQtyField,
      mrp: mrpField,
      unitSalePrice: uspField,
      consumerCare: consumerCareField,
      countryOfOrigin: countryOriginField,
      dates: datesField,
      otherDetectedDeclarations: otherDeclarations,
      pdpDimensions: input.pdpDimensions,
      metadata: {
        rawTextLength: rawText.length,
        extractedAt: new Date().toISOString(),
        extractorVersion: LabelExtractor.VERSION,
        ocrProvider: input.ocrProvider || 'raw_ocr',
      },
    };
  }
}

export const labelExtractor = new LabelExtractor();
