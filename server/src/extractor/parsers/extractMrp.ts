import type {
  ExtractedField,
  ExtractedMrp,
  ExtractedUnitSalePrice,
  OcrTextBlock,
} from '@sih/shared';

export function extractMrp(
  fullText: string,
  blocks: OcrTextBlock[] = []
): {
  mrpField: ExtractedField<ExtractedMrp>;
  uspField: ExtractedField<ExtractedUnitSalePrice>;
} {
  // Regex for MRP detection
  // Matches: MRP Rs. 120, M.R.P.: ₹ 499.00, Maximum Retail Price Rs 1899/- etc.
  const mrpRegex = /(?:M\.?R\.?P\.?|MAX(?:IMUM)?\s+RETAIL\s+PRICE)\s*(?:IS)?\s*[:.-]?\s*(?:RS\.?|INR|₹)?\s*([0-9]+(?:[,.][0-9]{1,2})?)/gi;
  
  // Regex for tax declaration presence
  const taxInclusiveRegex = /(?:INCL(?:USIVE)?\.?\s*OF\s*ALL\s*TAXES|INCL(?:UDING)?\s*TAXES|TAXES\s*INCLUDED)/i;

  const matches: Array<{
    amount: number;
    currency: string;
    rawText: string;
    sourceBlock?: OcrTextBlock;
    hasTax: boolean;
  }> = [];

  let match: RegExpExecArray | null;
  while ((match = mrpRegex.exec(fullText)) !== null) {
    const rawMatchText = match[0];
    const amountStr = match[1].replace(',', '');
    const numericAmount = parseFloat(amountStr);

    if (!isNaN(numericAmount) && numericAmount > 0) {
      // Check surrounding window (up to 60 chars) for tax declaration
      const windowStart = Math.max(0, match.index - 20);
      const windowEnd = Math.min(fullText.length, match.index + rawMatchText.length + 60);
      const surroundingContext = fullText.slice(windowStart, windowEnd);
      const hasTax = taxInclusiveRegex.test(surroundingContext);

      // Find matching OCR block if available for coordinates
      const matchedBlock = blocks.find((b) => b.text.toLowerCase().includes(rawMatchText.toLowerCase()));

      matches.push({
        amount: numericAmount,
        currency: rawMatchText.includes('₹') ? '₹' : 'INR',
        rawText: surroundingContext.trim(),
        sourceBlock: matchedBlock,
        hasTax,
      });
    }
  }

  // --- Process MRP Field ---
  let mrpField: ExtractedField<ExtractedMrp>;

  if (matches.length === 0) {
    mrpField = {
      value: null,
      sourceText: null,
      confidence: null,
      status: 'missing',
    };
  } else if (matches.length === 1) {
    const single = matches[0];
    mrpField = {
      value: {
        declaredAmount: single.amount,
        currency: single.currency,
        rawAmountString: single.amount.toFixed(2),
        isTaxInclusiveDeclared: single.hasTax,
        taxDeclarationText: single.hasTax ? 'Inclusive of all taxes' : null,
      },
      sourceText: single.rawText,
      confidence: single.sourceBlock?.confidence ?? 95,
      boundingBox: single.sourceBlock?.boundingBox,
      status: (single.sourceBlock?.confidence && single.sourceBlock.confidence < 65) ? 'uncertain' : 'detected',
      ambiguityNotes: (single.sourceBlock?.confidence && single.sourceBlock.confidence < 65)
        ? `Low OCR confidence (${single.sourceBlock.confidence}%) on retail price declaration.`
        : undefined,
    };
  } else {
    // Multiple prices detected (ambiguity preservation)
    const primary = matches[0];
    mrpField = {
      value: {
        declaredAmount: primary.amount,
        currency: primary.currency,
        rawAmountString: primary.amount.toFixed(2),
        isTaxInclusiveDeclared: primary.hasTax,
        taxDeclarationText: primary.hasTax ? 'Inclusive of all taxes' : null,
      },
      sourceText: primary.rawText,
      confidence: 70, // lowered confidence due to multiple conflicting price candidates
      boundingBox: primary.sourceBlock?.boundingBox,
      status: 'uncertain',
      ambiguityNotes: `Multiple distinct price candidates detected on packaging (${matches.map((m) => m.amount).join(', ')}).`,
      candidateValues: matches.map((m) => ({
        value: {
          declaredAmount: m.amount,
          currency: m.currency,
          rawAmountString: m.amount.toFixed(2),
          isTaxInclusiveDeclared: m.hasTax,
          taxDeclarationText: m.hasTax ? 'Inclusive of all taxes' : null,
        },
        sourceText: m.rawText,
        confidence: m.sourceBlock?.confidence,
        boundingBox: m.sourceBlock?.boundingBox,
      })),
    };
  }

  // --- Extract Unit Sale Price (USP) ---
  // Matches: USP: Rs. 0.30 / g, Unit Sale Price: ₹ 145.00 / L, Rs 1899.00 / N etc.
  const uspRegex = /(?:U\.?S\.?P\.?|UNIT\s+(?:SALE\s+)?PRICE)\s*[:.-]?\s*(?:RS\.?|INR|₹)?\s*([0-9]+(?:[,.][0-9]{1,4})?)\s*(?:\/|\s+PER\s+)\s*([a-zA-Z]+)/gi;

  const uspMatch = uspRegex.exec(fullText);
  let uspField: ExtractedField<ExtractedUnitSalePrice>;

  if (uspMatch) {
    const rawRate = parseFloat(uspMatch[1].replace(',', ''));
    const declaredUnit = uspMatch[2].trim().toLowerCase();
    const matchedBlock = blocks.find((b) => b.text.toLowerCase().includes(uspMatch[0].toLowerCase()));

    uspField = {
      value: {
        rate: isNaN(rawRate) ? null : rawRate,
        unit: declaredUnit,
        currency: uspMatch[0].includes('₹') ? '₹' : 'INR',
        rawRateString: uspMatch[1],
      },
      sourceText: uspMatch[0],
      confidence: matchedBlock?.confidence ?? 92,
      boundingBox: matchedBlock?.boundingBox,
      status: 'detected',
    };
  } else {
    uspField = {
      value: null,
      sourceText: null,
      confidence: null,
      status: 'missing',
    };
  }

  return { mrpField, uspField };
}
