import { QueuedInspectionItem, InspectionDraftPayload, ActiveScanDraft } from './types.js';

const QUEUE_STORAGE_KEY = 'lmr_offline_inspection_queue_v1';
const DRAFT_STORAGE_KEY = 'lmr_active_scan_draft_v1';

function persistQueue(queue: QueuedInspectionItem[]): void {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('[OfflineStorage] Failed to persist queue to localStorage:', error);
  }
}

export const offlineStorage = {
  /**
   * Retrieves all items from the offline persistent queue.
   */
  getQueue(): QueuedInspectionItem[] {
    try {
      const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (error) {
      console.warn('[OfflineStorage] Error reading inspection queue:', error);
      return [];
    }
  },

  /**
   * Enqueues a new inspection draft for offline preservation and future synchronization.
   */
  enqueueDraft(payload: InspectionDraftPayload, derivedTitle?: string): QueuedInspectionItem {
    const queue = this.getQueue();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const draftId = `DRAFT-${new Date().getFullYear()}-${randomSuffix}`;

    const title =
      derivedTitle ||
      payload.rawText.split('\n')[0]?.trim().slice(0, 50) ||
      'Unidentified Packaged Commodity';

    const newItem: QueuedInspectionItem = {
      draftId,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      status: 'QUEUED',
      payload,
      title,
      derivedTitle: title,
    };

    queue.unshift(newItem);
    persistQueue(queue);
    return newItem;
  },

  /**
   * Updates an existing queue item's status, retry counter, or error messages.
   */
  updateQueueItem(draftId: string, updates: Partial<QueuedInspectionItem>): void {
    const queue = this.getQueue();
    const index = queue.findIndex((item) => item.draftId === draftId);
    if (index !== -1) {
      queue[index] = { ...queue[index], ...updates };
      persistQueue(queue);
    }
  },

  /**
   * Removes an item by draft ID (e.g. after successful sync).
   */
  removeQueueItem(draftId: string): void {
    const queue = this.getQueue().filter((item) => item.draftId !== draftId);
    persistQueue(queue);
  },

  /**
   * Removes all items marked as SYNCED.
   */
  clearCompletedQueue(): void {
    const queue = this.getQueue().filter((item) => item.status !== 'SYNCED');
    persistQueue(queue);
  },

  /**
   * Auto-saves the active scan in progress to prevent data loss.
   */
  saveActiveDraft(draft: ActiveScanDraft): void {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (error) {
      console.warn('[OfflineStorage] Failed to auto-save scan draft:', error);
    }
  },

  /**
   * Retrieves the auto-saved active scan draft if present.
   */
  getActiveDraft(): ActiveScanDraft | null {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (error) {
      console.warn('[OfflineStorage] Failed to read active scan draft:', error);
      return null;
    }
  },

  /**
   * Clears the active scan draft upon successful submission or intentional reset.
   */
  clearActiveDraft(): void {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (error) {
      console.warn('[OfflineStorage] Failed to clear active draft:', error);
    }
  },
};
