import type {
  ExtractedField,
  ExtractedCountryOfOrigin,
  OcrTextBlock,
} from '@sih/shared';

export function extractCountryOfOrigin(
  fullText: string,
  blocks: OcrTextBlock[] = []
): ExtractedField<ExtractedCountryOfOrigin> {
  const originPattern = /(?:COUNTRY\s+OF\s+ORIGIN\s*[:.-]?\s*([a-zA-Z\s]+)|MADE\s+IN\s+([a-zA-Z\s]+)|PRODUCT\s+OF\s+([a-zA-Z\s]+)|IMPORTED\s+FROM\s+([a-zA-Z\s]+))/i;

  const match = originPattern.exec(fullText);

  if (!match) {
    return {
      value: null,
      sourceText: null,
      confidence: null,
      status: 'missing',
    };
  }

  const rawMatchText = match[0].trim();
  const detectedCountry = (match[1] || match[2] || match[3] || match[4] || '')
    .trim()
    .split(/\n|,/)[0]
    .trim();

  const isImported =
    detectedCountry.toLowerCase() !== 'india' &&
    detectedCountry.toLowerCase() !== 'bharat';

  const matchedBlock = blocks.find((b) => b.text.toLowerCase().includes(rawMatchText.toLowerCase()));

  return {
    value: {
      countryName: detectedCountry || null,
      isImported,
      declarationPhrase: rawMatchText,
    },
    sourceText: rawMatchText,
    confidence: matchedBlock?.confidence ?? 94,
    boundingBox: matchedBlock?.boundingBox,
    status: detectedCountry ? 'detected' : 'uncertain',
  };
}
