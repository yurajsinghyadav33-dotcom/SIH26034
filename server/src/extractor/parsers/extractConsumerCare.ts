import type {
  ExtractedField,
  ExtractedConsumerCare,
  OcrTextBlock,
} from '@sih/shared';

export function extractConsumerCare(
  fullText: string,
  blocks: OcrTextBlock[] = []
): ExtractedField<ExtractedConsumerCare> {
  const result: ExtractedConsumerCare = {};
  let detectedAny = false;

  // 1. Consumer Care Helpline / Phone Number
  // Matches: 1800-xxx-xxxx, 1800xxxxxx, 011-xxxxxxxx, +91-xxxxxxxxxx, 10-digit mobile, etc.
  const phoneRegex = /(?:(?:CALL|TEL(?:EPHONE)?|HELPLINE|TOLL[- ]FREE|CONTACT|PH(?:ONE)?\.?)\s*[:.-]?\s*)?((?:1800[- ]?[0-9]{3}[- ]?[0-9]{3,4})|(?:\+91[- ]?[0-9]{5}[- ]?[0-9]{5})|(?:0[0-9]{2,4}[- ]?[0-9]{6,8})|(?:[0-9]{10}))/i;
  
  // Look specifically within consumer complaint context first
  const consumerCareContextRegex = /(?:CONSUMER\s+(?:CARE|COMPLAINTS?|SERVICE|FEEDBACK|HELPLINE)|CUSTOMER\s+(?:CARE|SERVICE|SUPPORT|HELPLINE)|HELPLINE|TOLL[- ]FREE|FOR\s+FEEDBACK|IN\s+CASE\s+OF\s+COMPLAINTS?)(?:[^\n\r]{0,250})/i;
  const contextMatch = consumerCareContextRegex.exec(fullText);

  const textToSearch = contextMatch ? contextMatch[0] : fullText;

  let phoneMatch = phoneRegex.exec(textToSearch);
  if (!phoneMatch) {
    phoneMatch = phoneRegex.exec(fullText);
  }
  if (phoneMatch) {
    const rawNumber = (phoneMatch[1] || phoneMatch[0]).trim();
    if (rawNumber.length >= 8) {
      result.phone = rawNumber;
      detectedAny = true;
    }
  }

  // 2. Email Address
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
  let emailMatch = emailRegex.exec(textToSearch);
  if (!emailMatch) {
    emailMatch = emailRegex.exec(fullText);
  }
  if (emailMatch) {
    result.email = emailMatch[1].trim().toLowerCase();
    detectedAny = true;
  }

  // 3. Website
  const webRegex = /(?:WWW\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|HTTPS?:\/\/[a-zA-Z0-9.-]+)/i;
  const webMatch = webRegex.exec(textToSearch);
  if (webMatch) {
    result.website = webMatch[0].trim();
    detectedAny = true;
  }

  // 4. Contact Person Designation
  const designationRegex = /(?:CONSUMER\s+CARE\s+MANAGER|GRIEVANCE\s+OFFICER|CUSTOMER\s+CARE\s+EXECUTIVE|MANAGER\s+CONSUMER\s+RELATIONS)/i;
  const desigMatch = designationRegex.exec(textToSearch);
  if (desigMatch) {
    result.contactPersonDesignation = desigMatch[0].trim();
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

  const sourceSnippet = contextMatch ? contextMatch[0].trim() : (result.email || result.phone || '');
  const matchedBlock = blocks.find((b) => result.email && b.text.includes(result.email));

  // If only email is found without phone, or vice-versa, status is still detected (the compliance engine later decides if compliant)
  return {
    value: result,
    sourceText: sourceSnippet,
    confidence: matchedBlock?.confidence ?? 91,
    boundingBox: matchedBlock?.boundingBox,
    status: 'detected',
  };
}
