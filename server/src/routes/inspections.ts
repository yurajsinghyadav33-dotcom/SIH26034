import { Router, Request, Response } from 'express';
import type { ApiResponse } from '@sih/shared';
import { inspectionService, CreateInspectionInput } from '../database/InspectionService.js';

const router = Router();

// GET /api/v1/inspections - List and filter inspections
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, status, startDate, endDate, page, limit } = req.query;

    const result = await inspectionService.listInspections({
      search: typeof search === 'string' ? search : undefined,
      status: typeof status === 'string' ? status : undefined,
      startDate: typeof startDate === 'string' ? startDate : undefined,
      endDate: typeof endDate === 'string' ? endDate : undefined,
      page: page ? parseInt(String(page), 10) : 1,
      limit: limit ? parseInt(String(limit), 10) : 10,
    });

    const response: ApiResponse<typeof result> = {
      success: true,
      message: `Retrieved ${result.items.length} inspection records.`,
      data: result,
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('[Inspections Router] Error listing inspections:', error);
    const errorResponse: ApiResponse = {
      success: false,
      message: 'Failed to retrieve inspection records.',
      error: { code: 'LIST_FAILED', details: error instanceof Error ? error.message : String(error) },
      timestamp: new Date().toISOString(),
    };
    return res.status(500).json(errorResponse);
  }
});

// GET /api/v1/inspections/metrics/dashboard - Operational KPI statistics
router.get('/metrics/dashboard', async (_req: Request, res: Response) => {
  try {
    const metrics = await inspectionService.getDashboardMetrics();
    const response: ApiResponse<typeof metrics> = {
      success: true,
      message: 'Inspector dashboard operational metrics retrieved successfully.',
      data: metrics,
      timestamp: new Date().toISOString(),
    };
    return res.status(200).json(response);
  } catch (error) {
    console.error('[Inspections Router] Error getting dashboard metrics:', error);
    const errorResponse: ApiResponse = {
      success: false,
      message: 'Failed to aggregate dashboard metrics.',
      error: { code: 'METRICS_FAILED', details: error instanceof Error ? error.message : String(error) },
      timestamp: new Date().toISOString(),
    };
    return res.status(500).json(errorResponse);
  }
});

// GET /api/v1/inspections/:id - Retrieve specific inspection dossier
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Inspection ID parameter is required.',
        timestamp: new Date().toISOString(),
      });
    }

    const inspectionId = Array.isArray(id) ? id[0] : id;
    const dossier = await inspectionService.getInspectionById(String(inspectionId));
    if (!dossier) {
      return res.status(404).json({
        success: false,
        message: `Inspection with ID "${id}" not found.`,
        error: { code: 'NOT_FOUND' },
        timestamp: new Date().toISOString(),
      });
    }

    const response: ApiResponse<typeof dossier> = {
      success: true,
      message: `Inspection dossier retrieved for ${dossier.inspection.inspectionId}.`,
      data: dossier,
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('[Inspections Router] Error fetching inspection details:', error);
    const errorResponse: ApiResponse = {
      success: false,
      message: 'Failed to fetch inspection details.',
      error: { code: 'FETCH_FAILED', details: error instanceof Error ? error.message : String(error) },
      timestamp: new Date().toISOString(),
    };
    return res.status(500).json(errorResponse);
  }
});

// POST /api/v1/inspections - Create and persist new inspection
router.post('/', async (req: Request, res: Response) => {
  try {
    const payload: CreateInspectionInput = req.body;

    if (!payload || !payload.rawText || typeof payload.rawText !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload: "rawText" string is required.',
        error: { code: 'INVALID_PAYLOAD' },
        timestamp: new Date().toISOString(),
      });
    }

    const dossier = await inspectionService.createInspection(payload);

    const response: ApiResponse<{
      inspectionId: string;
      overallStatus: string;
      totalViolations: number;
      inspectedAt: string;
      dossier: typeof dossier;
    }> = {
      success: true,
      message: `Inspection ${dossier.inspection.inspectionId} safely persisted.`,
      data: {
        inspectionId: dossier.inspection.inspectionId,
        overallStatus: dossier.inspection.overallStatus,
        totalViolations: dossier.inspection.totalViolations,
        inspectedAt: dossier.inspection.inspectedAt.toISOString(),
        dossier,
      },
      timestamp: new Date().toISOString(),
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('[Inspections Router] Error creating inspection:', error);
    const errorResponse: ApiResponse = {
      success: false,
      message: 'Failed to safely persist inspection record.',
      error: { code: 'CREATION_FAILED', details: error instanceof Error ? error.message : String(error) },
      timestamp: new Date().toISOString(),
    };
    return res.status(500).json(errorResponse);
  }
});

export const inspectionRouter = router;
