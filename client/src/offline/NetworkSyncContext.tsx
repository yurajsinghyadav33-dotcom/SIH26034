import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ConnectionStatus,
  QueuedInspectionItem,
  InspectionDraftPayload,
  ActiveScanDraft,
} from './types.js';
import { offlineStorage } from './offlineStorage.js';

export interface NetworkSyncContextValue {
  connectionStatus: ConnectionStatus;
  queuedItems: QueuedInspectionItem[];
  pendingCount: number;
  lastSyncTime: string | null;
  syncAllQueued: () => Promise<{ successCount: number; failureCount: number }>;
  retryFailedItems: () => Promise<void>;
  enqueueInspection: (payload: InspectionDraftPayload, title?: string) => QueuedInspectionItem;
  removeQueuedItem: (draftId: string) => void;
  activeDraft: ActiveScanDraft | null;
  saveDraft: (draft: ActiveScanDraft) => void;
  clearDraft: () => void;
  setSimulatedOffline?: (offline: boolean) => void;
  isSimulatedOffline: boolean;
}

const NetworkSyncContext = createContext<NetworkSyncContextValue | null>(null);

export const NetworkSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [hasFailedSync, setHasFailedSync] = useState<boolean>(false);
  const [queuedItems, setQueuedItems] = useState<QueuedInspectionItem[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [activeDraft, setActiveDraft] = useState<ActiveScanDraft | null>(null);

  // Load initial queue and active draft from local storage
  useEffect(() => {
    setQueuedItems(offlineStorage.getQueue());
    setActiveDraft(offlineStorage.getActiveDraft());
  }, []);

  // Listen to standard browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger auto-sync when network returns
      syncQueueWithServer();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial server health heartbeat check
    checkServerConnectivity();

    const interval = setInterval(() => {
      checkServerConnectivity();
    }, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const checkServerConnectivity = async () => {
    if (isSimulatedOffline) {
      setIsOnline(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5050/api/v1/health', {
        method: 'GET',
        cache: 'no-store',
      });
      if (res.ok) {
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }
    } catch {
      // Server unreachable or network offline
      setIsOnline(false);
    }
  };

  const refreshQueue = useCallback(() => {
    setQueuedItems(offlineStorage.getQueue());
  }, []);

  // Core Sync Engine: Uploads queued items to the enforcement backend
  const syncQueueWithServer = useCallback(async (): Promise<{ successCount: number; failureCount: number }> => {
    if (isSimulatedOffline || !navigator.onLine) {
      return { successCount: 0, failureCount: 0 };
    }

    const currentQueue = offlineStorage.getQueue().filter((item) => item.status !== 'SYNCED');
    if (currentQueue.length === 0) {
      setHasFailedSync(false);
      return { successCount: 0, failureCount: 0 };
    }

    setIsSyncing(true);
    let successCount = 0;
    let failureCount = 0;

    for (const item of currentQueue) {
      offlineStorage.updateQueueItem(item.draftId, {
        status: 'SYNCING',
        lastAttemptAt: new Date().toISOString(),
      });
      refreshQueue();

      try {
        const res = await fetch('http://localhost:5050/api/v1/inspections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload),
        });

        if (res.ok) {
          offlineStorage.updateQueueItem(item.draftId, {
            status: 'SYNCED',
            errorDetails: undefined,
          });
          successCount++;
        } else {
          const errData = await res.json().catch(() => ({}));
          offlineStorage.updateQueueItem(item.draftId, {
            status: 'FAILED',
            retryCount: item.retryCount + 1,
            errorDetails: errData.message || `Server error (${res.status})`,
          });
          failureCount++;
        }
      } catch (error) {
        offlineStorage.updateQueueItem(item.draftId, {
          status: 'FAILED',
          retryCount: item.retryCount + 1,
          errorDetails: error instanceof Error ? error.message : 'Network failure during upload',
        });
        failureCount++;
      }

      refreshQueue();
    }

    setIsSyncing(false);
    setLastSyncTime(new Date().toISOString());

    if (failureCount > 0) {
      setHasFailedSync(true);
    } else {
      setHasFailedSync(false);
      // Clean completed items after 2 seconds
      setTimeout(() => {
        offlineStorage.clearCompletedQueue();
        refreshQueue();
      }, 2000);
    }

    return { successCount, failureCount };
  }, [isSimulatedOffline, refreshQueue]);

  const retryFailedItems = useCallback(async () => {
    const queue = offlineStorage.getQueue();
    for (const item of queue) {
      if (item.status === 'FAILED') {
        offlineStorage.updateQueueItem(item.draftId, { status: 'QUEUED' });
      }
    }
    refreshQueue();
    await syncQueueWithServer();
  }, [refreshQueue, syncQueueWithServer]);

  const enqueueInspection = useCallback(
    (payload: InspectionDraftPayload, title?: string): QueuedInspectionItem => {
      const item = offlineStorage.enqueueDraft(payload, title);
      refreshQueue();
      // If online, attempt background sync immediately
      if (isOnline && !isSimulatedOffline) {
        syncQueueWithServer();
      }
      return item;
    },
    [isOnline, isSimulatedOffline, refreshQueue, syncQueueWithServer]
  );

  const removeQueuedItem = useCallback(
    (draftId: string) => {
      offlineStorage.removeQueueItem(draftId);
      refreshQueue();
    },
    [refreshQueue]
  );

  const saveDraft = useCallback((draft: ActiveScanDraft) => {
    offlineStorage.saveActiveDraft(draft);
    setActiveDraft(draft);
  }, []);

  const clearDraft = useCallback(() => {
    offlineStorage.clearActiveDraft();
    setActiveDraft(null);
  }, []);

  // Compute Current Unambiguous Connection Status
  const connectionStatus: ConnectionStatus = isSyncing
    ? 'SYNCING'
    : hasFailedSync
    ? 'FAILED_SYNC'
    : !isOnline || isSimulatedOffline
    ? 'OFFLINE'
    : 'ONLINE';

  const pendingCount = queuedItems.filter((i) => i.status !== 'SYNCED').length;

  return (
    <NetworkSyncContext.Provider
      value={{
        connectionStatus,
        queuedItems,
        pendingCount,
        lastSyncTime,
        syncAllQueued: syncQueueWithServer,
        retryFailedItems,
        enqueueInspection,
        removeQueuedItem,
        activeDraft,
        saveDraft,
        clearDraft,
        setSimulatedOffline: (sim) => {
          setIsSimulatedOffline(sim);
          setIsOnline(!sim);
        },
        isSimulatedOffline,
      }}
    >
      {children}
    </NetworkSyncContext.Provider>
  );
};

export const useNetworkSync = (): NetworkSyncContextValue => {
  const ctx = useContext(NetworkSyncContext);
  if (!ctx) {
    throw new Error('useNetworkSync must be used within a NetworkSyncProvider');
  }
  return ctx;
};
