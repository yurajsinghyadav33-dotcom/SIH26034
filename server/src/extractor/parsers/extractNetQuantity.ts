import type {
  ExtractedField,
  ExtractedNetQuantity,
  OcrTextBlock,
} from '@sih/shared';

// Standard unit mappings for normalized units
const UNIT_MAP: Record<string, string> = {
  g: 'g',
  gm: 'g',
  gms: 'g',
  gram: 'g',
  grams: 'g',
  kg: 'kg',
  kgs: 'kg',
  kilogram: 'kg',
  kilograms: 'kg',
  ml: 'ml',
  millilitre: 'ml',
  millilitres: 'ml',
  l: 'l',
  ltr: 'l',
  litre: 'l',
  litres: 'l',
  n: 'N',
  no: 'N',
  nos: 'N',
  number: 'N',
  numbers: 'N',
  u: 'N',
  unit: 'N',
  units: 'N',
  piece: 'N',
  pieces: 'N',
  m: 'm',
  metre: 'm',
  meter: 'm',
  cm: 'cm',
};

export function extractNetQuantity(
  fullText: string,
  blocks: OcrTextBlock[] = []
): ExtractedField<ExtractedNetQuantity> {
  // Regex to capture net quantity declarations
  // Matches: "NET QTY: 400 g", "Net Weight: 1.5 kg", "Net Content : 1 Litre", "Quantity: 1 N", "Net Qty: Approx 500 g"
  const qtyRegex = /(?:NET\s+(?:QTY\.?|QUANTITY|WT\.?|WEIGHT|CONTENT|CONTENTS)|QUANTITY)\s*[:.-]?\s*(?:APPROX(?:IMATE)?\.?|ABOUT|~)?\s*([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z]+)/gi;

  // Regex for approximate/qualified prefixes
  const approxRegex = /(?:APPROX(?:IMATE)?\.?|WHEN\s+PACKED|AT\s+PACKING)/i;

  // Regex for multi-unit packs (e.g. "Pack of 3", "3 units", "4 x 50g")
  const packOfRegex = /(?:PACK\s+OF\s+([0-9]+)|([0-9]+)\s*X\s*([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z]+))/i;

  const matches: Array<{
    amount: number;
    declaredUnit: string;
    normalizedUnit: string | null;
    rawText: string;
    isApprox: boolean;
    sourceBlock?: OcrTextBlock;
    packCount?: number;
  }> = [];

  let match: RegExpExecArray | null;
  while ((match = qtyRegex.exec(fullText)) !== null) {
    const rawMatchText = match[0];
    const amount = parseFloat(match[1]);
    const rawUnit = match[2].trim().toLowerCase();
    const normalizedUnit = UNIT_MAP[rawUnit] || rawUnit;

    if (!isNaN(amount) && amount > 0) {
      // Check surrounding window for approx wording
      const windowStart = Math.max(0, match.index - 20);
      const windowEnd = Math.min(fullText.length, match.index + rawMatchText.length + 30);
      const surroundingContext = fullText.slice(windowStart, windowEnd);
      const isApprox = approxRegex.test(surroundingContext);

      // Check for multi-pack context
      const packMatch = packOfRegex.exec(surroundingContext);
      let packCount: number | undefined;
      if (packMatch) {
        packCount = parseInt(packMatch[1] || packMatch[2], 10);
      }

      const matchedBlock = blocks.find((b) => b.text.toLowerCase().includes(rawMatchText.toLowerCase()));

      matches.push({
        amount,
        declaredUnit: match[2],
        normalizedUnit,
        rawText: surroundingContext.trim(),
        isApprox,
        sourceBlock: matchedBlock,
        packCount,
      });
    }
  }

  if (matches.length === 0) {
    return {
      value: null,
      sourceText: null,
      confidence: null,
      status: 'missing',
    };
  }

  if (matches.length === 1) {
    const single = matches[0];
    return {
      value: {
        numericValue: single.amount,
        declaredUnit: single.declaredUnit,
        normalizedUnit: single.normalizedUnit,
        numberOfUnits: single.packCount ?? 1,
        isApproximatePrefixDetected: single.isApprox,
      },
      sourceText: single.rawText,
      confidence: single.sourceBlock?.confidence ?? 94,
      boundingBox: single.sourceBlock?.boundingBox,
      status: single.isApprox
        ? 'uncertain'
        : (single.sourceBlock?.confidence && single.sourceBlock.confidence < 65)
        ? 'uncertain'
        : 'detected',
      ambiguityNotes: single.isApprox
        ? 'Net quantity has qualifying/approximate prefix.'
        : (single.sourceBlock?.confidence && single.sourceBlock.confidence < 65)
        ? `Low OCR confidence (${single.sourceBlock.confidence}%) on net quantity declaration.`
        : undefined,
    };
  }

  // Multiple quantity candidates found (ambiguity preservation)
  const primary = matches[0];
  return {
    value: {
      numericValue: primary.amount,
      declaredUnit: primary.declaredUnit,
      normalizedUnit: primary.normalizedUnit,
      numberOfUnits: primary.packCount ?? 1,
      isApproximatePrefixDetected: primary.isApprox,
    },
    sourceText: primary.rawText,
    confidence: 65,
    boundingBox: primary.sourceBlock?.boundingBox,
    status: 'uncertain',
    ambiguityNotes: `Multiple quantity figures detected (${matches.map((m) => `${m.amount} ${m.declaredUnit}`).join(', ')}).`,
    candidateValues: matches.map((m) => ({
      value: {
        numericValue: m.amount,
        declaredUnit: m.declaredUnit,
        normalizedUnit: m.normalizedUnit,
        numberOfUnits: m.packCount ?? 1,
        isApproximatePrefixDetected: m.isApprox,
      },
      sourceText: m.rawText,
      confidence: m.sourceBlock?.confidence,
      boundingBox: m.sourceBlock?.boundingBox,
    })),
  };
}
