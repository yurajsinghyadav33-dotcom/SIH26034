import { Router, Request, Response } from 'express';
import type { ApiResponse, RawOcrInput, NormalizedCommodityExtraction, ComplianceEvaluationReport } from '@sih/shared';
import { labelExtractor } from '../extractor/LabelExtractor.js';
import { ruleEngine } from '../rules/RuleEngine.js';
import { complianceAnalysisCache } from '../services/cacheService.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Rate limiter: Max 60 compliance checks per minute per IP
const complianceRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: 'Legal Metrology compliance analysis rate limit exceeded. Please wait a moment.',
});

// Rate limiter: Max 30 OCR operations per minute per IP
const ocrRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: 'Packaging OCR processing rate limit exceeded. Please wait a moment.',
});

export interface ComplianceAnalysisResponse {
  extraction: NormalizedCommodityExtraction;
  report: ComplianceEvaluationReport;
}

// POST /api/v1/compliance/analyze
router.post('/analyze', complianceRateLimiter, (req: Request, res: Response) => {
  try {
    const payload: RawOcrInput = req.body;

    if (!payload || typeof payload.rawText !== 'string') {
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Invalid request: "rawText" string is required for compliance analysis.',
        error: { code: 'INVALID_PAYLOAD' },
        timestamp: new Date().toISOString(),
      };
      return res.status(400).json(errorResponse);
    }

    // High Efficiency SHA-256 Cache Check
    const cacheKey = complianceAnalysisCache.generateKey(payload.rawText);
    const cachedData = complianceAnalysisCache.get(cacheKey) as ComplianceAnalysisResponse | null;
    if (cachedData) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json({
        success: true,
        message: 'Compliance analysis retrieved from high-speed cache.',
        data: cachedData,
        timestamp: new Date().toISOString(),
      });
    }

    res.setHeader('X-Cache', 'MISS');

    // 1. Convert OCR output into normalized packaged-commodity information (Step 6)
    const extraction = labelExtractor.extract(payload);

    // 2. Deterministically evaluate Legal Metrology compliance rules (Step 7)
    const report = ruleEngine.evaluate(extraction);

    const resultData: ComplianceAnalysisResponse = {
      extraction,
      report,
    };

    complianceAnalysisCache.set(cacheKey, resultData);

    const response: ApiResponse<ComplianceAnalysisResponse> = {
      success: true,
      message: 'Compliance analysis completed successfully.',
      data: resultData,
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('[Compliance Router] Error during compliance analysis:', error);
    const errorResponse: ApiResponse = {
      success: false,
      message: 'An internal error occurred during compliance evaluation.',
      error: { code: 'INTERNAL_ERROR', details: error instanceof Error ? error.message : String(error) },
      timestamp: new Date().toISOString(),
    };
    return res.status(500).json(errorResponse);
  }
});

// POST /api/v1/compliance/ocr
router.post('/ocr', ocrRateLimiter, async (req: Request, res: Response) => {
  try {
    const { image, fileName } = req.body;

    if (!image || typeof image !== 'string') {
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Invalid request: "image" base64 DataURL is required.',
        error: { code: 'INVALID_PAYLOAD' },
        timestamp: new Date().toISOString(),
      };
      return res.status(400).json(errorResponse);
    }

    const { processImageOcr } = await import('../pipeline/ocrService.js');
    const ocrResult = await processImageOcr(image, fileName);

    const response: ApiResponse = {
      success: true,
      message: 'Packaging surface OCR extracted successfully.',
      data: ocrResult,
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('[Compliance Router] Error during image OCR:', error);
    const errorResponse: ApiResponse = {
      success: false,
      message: 'Failed to process packaging image OCR.',
      error: { code: 'OCR_ERROR', details: error instanceof Error ? error.message : String(error) },
      timestamp: new Date().toISOString(),
    };
    return res.status(500).json(errorResponse);
  }
});

export const complianceRouter = router;
