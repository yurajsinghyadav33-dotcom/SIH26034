import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import type { ApiResponse } from '@sih/shared';
import { complianceRouter } from './routes/compliance.js';
import { inspectionRouter } from './routes/inspections.js';
import { securityHeadersMiddleware } from './middleware/securityHeaders.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security & Hardening Middlewares
app.use(securityHeadersMiddleware);
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Compliance Analysis Pipeline API
app.use(`${config.apiPrefix}/compliance`, complianceRouter);

// Inspections History and Persistence API
app.use(`${config.apiPrefix}/inspections`, inspectionRouter);

// Health Check Endpoint
app.get(`${config.apiPrefix}/health`, (_req: Request, res: Response) => {
  const response: ApiResponse<{ status: string; env: string; version: string }> = {
    success: true,
    message: 'SIH26034 Legal Metrology Compliance API is operational',
    data: {
      status: 'healthy',
      env: config.nodeEnv,
      version: config.ruleEngineVersion,
    },
    timestamp: new Date().toISOString(),
  };
  res.status(200).json(response);
});

// Fallback 404 handler
app.use((_req: Request, res: Response) => {
  const notFoundResponse: ApiResponse = {
    success: false,
    message: 'Requested endpoint does not exist',
    error: {
      code: 'NOT_FOUND',
    },
    timestamp: new Date().toISOString(),
  };
  res.status(404).json(notFoundResponse);
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server if directly executed
const server = app.listen(config.port, () => {
  console.log(`[API Server] Running on http://localhost:${config.port}${config.apiPrefix}`);
});

export { app, server };
