import type {
  ExtractedField,
  ExtractedProductName,
  OcrTextBlock,
} from '@sih/shared';

export function extractProductName(
  fullText: string,
  blocks: OcrTextBlock[] = []
): ExtractedField<ExtractedProductName> {
  // Regex to detect common/generic name declarations
  // Matches: "GENERIC NAME: Oats", "COMMODITY: Refined Oil", "PRODUCT: Herbal Sunscreen"
  const namePattern = /(?:GENERIC\s+NAME|COMMON\s+NAME|COMMODITY|PRODUCT\s+(?:NAME)?)\s*[:.-]?\s*([^\n\r,;]{3,60})/i;

  const match = namePattern.exec(fullText);

  if (match) {
    const genericName = match[1].trim();
    const matchedBlock = blocks.find((b) => b.text.includes(genericName));

    return {
      value: {
        genericName,
      },
      sourceText: match[0],
      confidence: matchedBlock?.confidence ?? 92,
      boundingBox: matchedBlock?.boundingBox,
      status: 'detected',
    };
  }

  // Fallback: Check top lines of OCR text (first non-empty 1-2 lines often denote the commodity title)
  const lines = fullText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length >= 3 && !l.toLowerCase().includes('mrp') && !l.toLowerCase().includes('mfg'));

  if (lines.length > 0) {
    return {
      value: {
        genericName: lines[0],
      },
      sourceText: lines[0],
      confidence: 65, // lower confidence because extracted via positional heuristic
      status: 'uncertain',
      ambiguityNotes: 'Extracted from packaging title header without explicit "Generic Name:" prefix.',
    };
  }

  return {
    value: null,
    sourceText: null,
    confidence: null,
    status: 'missing',
  };
}
