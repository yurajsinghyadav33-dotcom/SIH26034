import type {
  ExtractedField,
  ExtractedDates,
  ExtractedDateItem,
  OcrTextBlock,
} from '@sih/shared';

const MONTH_NAMES: Record<string, number> = {
  jan: 1,
  january: 1,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  apr: 4,
  april: 4,
  may: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  december: 12,
};

function parseDateSubstring(text: string): ExtractedDateItem | null {
  // Pattern 1: DD/MM/YYYY or DD-MM-YYYY
  const ddmmyyyyPattern = /\b([0-9]{1,2})[\/\.-]([0-9]{1,2})[\/\.-]([0-9]{4}|[0-9]{2})\b/;
  const ddmmyyyyMatch = ddmmyyyyPattern.exec(text);

  if (ddmmyyyyMatch) {
    const month = parseInt(ddmmyyyyMatch[2], 10);
    let year = parseInt(ddmmyyyyMatch[3], 10);
    if (year < 100) year += 2000;
    if (month >= 1 && month <= 12 && year >= 2000 && year <= 2040) {
      return {
        dateString: `${month.toString().padStart(2, '0')}/${year}`,
        month,
        year,
        rawText: ddmmyyyyMatch[0],
      };
    }
  }

  // Pattern 2: MM/YYYY or MM/YY (Note: 4-digit year prioritized over 2-digit)
  const mmyyyyPattern = /\b([0-9]{1,2})[\/\.-]([0-9]{4}|[0-9]{2})\b/;
  const mmyyyyMatch = mmyyyyPattern.exec(text);

  if (mmyyyyMatch) {
    const month = parseInt(mmyyyyMatch[1], 10);
    let year = parseInt(mmyyyyMatch[2], 10);
    if (year < 100) year += 2000;
    if (month >= 1 && month <= 12 && year >= 2000 && year <= 2040) {
      return {
        dateString: `${month.toString().padStart(2, '0')}/${year}`,
        month,
        year,
        rawText: mmyyyyMatch[0],
      };
    }
  }

  // Pattern 3: Month name and Year (e.g. "Jan 2026", "December 2025")
  const wordMonthPattern = /(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*[,.-]?\s*([0-9]{4}|[0-9]{2})/i;
  const wordMatch = wordMonthPattern.exec(text);

  if (wordMatch) {
    const month = MONTH_NAMES[wordMatch[1].toLowerCase()];
    let year = parseInt(wordMatch[2], 10);
    if (year < 100) year += 2000;
    if (month && year >= 2000 && year <= 2040) {
      return {
        dateString: `${month.toString().padStart(2, '0')}/${year}`,
        month,
        year,
        rawText: wordMatch[0],
      };
    }
  }

  return null;
}

export function extractDates(
  fullText: string,
  blocks: OcrTextBlock[] = []
): ExtractedField<ExtractedDates> {
  const result: ExtractedDates = {};
  let detectedAny = false;

  // 1. Manufacturing Date (explicitly avoid matching "Manufactured By" or "Manufactured & Packed")
  const mfgRegex = /(?:MFD\.?|MFG\.?|MANUFACTURED(?:\s+ON)?|DATE\s+OF\s+MFG|DATE\s+OF\s+MANUFACTURE)(?!\s+(?:BY|&|AND))\s*[:.-]?\s*([^\n\r,;]{3,25})/gi;
  let mfgMatch: RegExpExecArray | null;
  while ((mfgMatch = mfgRegex.exec(fullText)) !== null) {
    const parsed = parseDateSubstring(mfgMatch[1]);
    if (parsed) {
      result.dateOfManufacture = parsed;
      detectedAny = true;
      break;
    }
  }

  // 2. Packaging Date
  const pkdRegex = /(?:PKD\.?|PKG\.?|PACKED(?:\s+ON)?|DATE\s+OF\s+PACKAGING|DATE\s+OF\s+PACK)\s*[:.-]?\s*([^\n\r,;]{3,25})/i;
  const pkdMatch = pkdRegex.exec(fullText);
  if (pkdMatch) {
    const parsed = parseDateSubstring(pkdMatch[1]);
    if (parsed) {
      result.dateOfPackaging = parsed;
      detectedAny = true;
    }
  }

  // 3. Date of Import
  const impDateRegex = /(?:DATE\s+OF\s+IMPORT|IMPORT(?:ED)?\s+(?:ON|DATE)|IMP\.?\s+DATE)\s*[:.-]?\s*([^\n\r,;]{3,25})/i;
  const impDateMatch = impDateRegex.exec(fullText);
  if (impDateMatch) {
    const parsed = parseDateSubstring(impDateMatch[1]);
    if (parsed) {
      result.dateOfImport = parsed;
      detectedAny = true;
    }
  }

  // 4. Expiry Date
  const expRegex = /(?:EXP\.?|EXPIRY(?:\s+DATE)?|USE\s+BY|BEST\s+BEFORE\s+DATE)\s*[:.-]?\s*([^\n\r,;]{3,25})/i;
  const expMatch = expRegex.exec(fullText);
  if (expMatch) {
    const parsed = parseDateSubstring(expMatch[1]);
    if (parsed) {
      result.expiryDate = parsed;
      detectedAny = true;
    }
  }

  // 4. Best Before Period (e.g. "Best before 12 months from manufacture")
  const bestBeforeRegex = /(?:BEST\s+BEFORE\s+[0-9]+\s+(?:MONTHS?|DAYS?|WEEKS?|YEARS?)(?:\s+FROM\s+[a-zA-Z\s]+)?)/i;
  const bbMatch = bestBeforeRegex.exec(fullText);
  if (bbMatch) {
    result.bestBeforePeriod = bbMatch[0].trim();
    detectedAny = true;
  }

  // 5. Batch or Lot Number
  const batchRegex = /(?:BATCH\s+(?:NO\.?|NUMBER)|LOT\s+(?:NO\.?|NUMBER)|B\.?\s*NO\.?)\s*[:.-]?\s*([A-Za-z0-9\-_/]+)/i;
  const batchMatch = batchRegex.exec(fullText);
  if (batchMatch) {
    result.batchOrLotNumber = batchMatch[1].trim();
    detectedAny = true;
  }

  if (!detectedAny) {
    return {
      value: null,
      sourceText: null,
      confidence: null,
      status: 'missing',
    };
  }

  // Determine matching block for coordinates
  const matchedBlock = blocks.find(
    (b) =>
      (result.dateOfManufacture && b.text.includes(result.dateOfManufacture.rawText)) ||
      (result.dateOfPackaging && b.text.includes(result.dateOfPackaging.rawText))
  );

  return {
    value: result,
    sourceText: mfgMatch?.[0] || pkdMatch?.[0] || expMatch?.[0] || null,
    confidence: matchedBlock?.confidence ?? 90,
    boundingBox: matchedBlock?.boundingBox,
    status: 'detected',
  };
}
