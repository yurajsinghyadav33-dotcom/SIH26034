import type { CommodityCategory, PdpDimensions } from '@sih/shared';

export type ConnectionStatus = 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'FAILED_SYNC';

export type QueueItemStatus = 'QUEUED' | 'SYNCING' | 'FAILED' | 'SYNCED';

export interface InspectionDraftPayload {
  rawText: string;
  pdpDimensions?: PdpDimensions;
  category?: CommodityCategory;
  imageUrl?: string;
  ocrProvider?: string;
  inspectorId?: string;
  batchNumber?: string;
  offlineNotes?: string;
}

export interface QueuedInspectionItem {
  draftId: string;
  createdAt: string;
  lastAttemptAt?: string;
  retryCount: number;
  status: QueueItemStatus;
  errorDetails?: string;
  payload: InspectionDraftPayload;
  title: string;
  derivedTitle?: string;
}

export interface ActiveScanDraft {
  rawText: string;
  pdpHeight: number;
  pdpWidth: number;
  selectedSampleId?: string;
  pdpDimensions?: PdpDimensions;
  lastUpdated?: string;
}
