import type {
  ExtractedField,
  ExtractedManufacturerInfo,
  OcrTextBlock,
} from '@sih/shared';

export function extractManufacturer(
  fullText: string,
  blocks: OcrTextBlock[] = []
): ExtractedField<ExtractedManufacturerInfo> {
  // Regex to detect manufacturer / packer / importer declarations
  const mfgPattern = /(?:MANUFACTURED\s+(?:&|AND)\s+PACKED\s+BY|MFD\s*&\s*PKD\s*BY|MANUFACTURED\s+BY|MFD\.?\s+BY|PACKED\s+BY|PKD\.?\s+BY|IMPORTED\s+BY|IMP\.?\s+BY|MARKETED\s+BY)\s*[:.-]?\s*([^\n\r]+(?:\n[^\n\r]+){0,3})/i;

  const match = mfgPattern.exec(fullText);

  if (!match) {
    return {
      value: null,
      sourceText: null,
      confidence: null,
      status: 'missing',
    };
  }

  const rawDeclarationBlock = match[0];
  const upperDeclaration = rawDeclarationBlock.toUpperCase();

  // Determine entity type
  let entityType: ExtractedManufacturerInfo['entityType'] = 'UNKNOWN';
  if (upperDeclaration.includes('MANUFACTURED AND PACKED') || upperDeclaration.includes('MFD & PKD')) {
    entityType = 'MANUFACTURED_AND_PACKED_BY';
  } else if (upperDeclaration.includes('IMPORTED')) {
    entityType = 'IMPORTER';
  } else if (upperDeclaration.includes('PACKED')) {
    entityType = 'PACKER';
  } else if (upperDeclaration.includes('MANUFACTURED') || upperDeclaration.includes('MFD')) {
    entityType = 'MANUFACTURER';
  }

  // Extract 6-digit Indian PIN Code
  const pinRegex = /\b([1-9][0-9]{5})\b/;
  const pinMatch = pinRegex.exec(rawDeclarationBlock);
  const pinCode = pinMatch ? pinMatch[1] : undefined;

  // Split lines to identify company name (usually 1st line after declaration header)
  const lines = rawDeclarationBlock
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Clean company name from the first line
  let companyName = lines[0] || '';
  companyName = companyName
    .replace(/(?:MANUFACTURED\s+(?:&|AND)\s+PACKED\s+BY|MFD\s*&\s*PKD\s*BY|MANUFACTURED\s+BY|MFD\.?\s+BY|PACKED\s+BY|PKD\.?\s+BY|IMPORTED\s+BY|IMP\.?\s+BY|MARKETED\s+BY)\s*[:.-]?/i, '')
    .trim();

  // If address elements follow on the same line after comma, separate the company name
  if (companyName.includes(',')) {
    companyName = companyName.split(',')[0].trim();
  }

  // Full address is the combined block text
  const fullAddress = lines.join(', ');

  const matchedBlock = blocks.find((b) => b.text.includes(companyName));

  return {
    value: {
      entityType,
      name: companyName || null,
      fullAddress,
      pinCode,
    },
    sourceText: rawDeclarationBlock.trim(),
    confidence: matchedBlock?.confidence ?? 90,
    boundingBox: matchedBlock?.boundingBox,
    status: companyName ? 'detected' : 'uncertain',
    ambiguityNotes: !pinCode ? 'Postal address detected without standard 6-digit PIN code.' : undefined,
  };
}
