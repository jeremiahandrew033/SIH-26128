// SyncService.ts - Engine for synchronizing offline records with backend

import { offlineStore, SyncQueueItem } from './OfflineStore';
import { SyncQueue } from './SyncQueue';
import { createHealthReport, createMortalityReport, createAnimal, uploadCaseAttachment } from '../services/api';

export type SyncStatusState = {
  isSyncing: boolean;
  lastSyncTime: string | null;
  pendingCount: number;
  syncedCount: number;
  failedCount: number;
  message?: string;
};

type SyncListener = (status: SyncStatusState) => void;

class SyncService {
  private isSyncing = false;
  private listeners: Set<SyncListener> = new Set();
  private lastSyncTime: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.autoSyncIfOnline());
      window.addEventListener('simulated-offline-changed', () => this.autoSyncIfOnline());
    }
  }

  private autoSyncIfOnline() {
    const isSimOffline = localStorage.getItem('demo_simulated_offline') === 'true';
    if (navigator.onLine && !isSimOffline) {
      this.syncPendingRecords();
    }
  }

  subscribe(listener: SyncListener) {
    this.listeners.add(listener);
    this.notify();
    return () => {
      this.listeners.delete(listener);
    };
  }

  private async notify(customMessage?: string) {
    const queue = await offlineStore.getQueue();
    const records = await offlineStore.getAllRecords();
    
    const pendingCount = queue.filter(q => q.status === 'pending').length;
    const syncingCount = queue.filter(q => q.status === 'syncing').length;
    const failedCount = queue.filter(q => q.status === 'failed').length;
    const syncedCount = records.filter(r => r.sync_status === 'synced').length;

    const state: SyncStatusState = {
      isSyncing: this.isSyncing || syncingCount > 0,
      lastSyncTime: this.lastSyncTime,
      pendingCount,
      syncedCount,
      failedCount,
      message: customMessage
    };

    this.listeners.forEach(l => l(state));
  }

  async getSyncCounts() {
    const queue = await offlineStore.getQueue();
    const records = await offlineStore.getAllRecords();
    return {
      pending: queue.filter(q => q.status === 'pending').length,
      syncing: queue.filter(q => q.status === 'syncing').length,
      syncedToday: records.filter(r => r.sync_status === 'synced').length,
      failed: queue.filter(q => q.status === 'failed').length,
    };
  }

  async syncPendingRecords(): Promise<{ successCount: number; failedCount: number }> {
    if (this.isSyncing) return { successCount: 0, failedCount: 0 };

    this.isSyncing = true;
    this.notify("Syncing pending records...");

    const pendingItems = await SyncQueue.getPending();
    let successCount = 0;
    let failedCount = 0;

    for (const item of pendingItems) {
      const success = await this.syncRecord(item);
      if (success) {
        successCount++;
      } else {
        failedCount++;
      }
    }

    this.isSyncing = false;
    this.lastSyncTime = new Date().toISOString();
    
    if (failedCount > 0) {
      this.notify("Some reports could not be synchronized. We'll retry later.");
    } else if (successCount > 0) {
      this.notify("All pending reports synchronized.");
    } else {
      this.notify();
    }

    return { successCount, failedCount };
  }

  async syncRecord(item: SyncQueueItem): Promise<boolean> {
    try {
      await SyncQueue.updateStatus(item.id, 'syncing');
      await offlineStore.updateRecordStatus(item.id, 'syncing');
      this.notify(`Uploading ${item.entity_type}...`);

      const record = await offlineStore.getRecord(item.id);
      if (!record) {
        await SyncQueue.remove(item.id);
        return false;
      }

      let serverId = '';
      const payload = { ...item.payload };

      // Resolve foreign key mappings if payload references local IDs
      if (payload.animal_id && payload.animal_id.startsWith('LOCAL-')) {
        const mappedAnimalId = await offlineStore.getServerId(payload.animal_id);
        if (mappedAnimalId) {
          payload.animal_id = mappedAnimalId;
        }
      }
      if (payload.herd_id && payload.herd_id.startsWith('LOCAL-')) {
        const mappedHerdId = await offlineStore.getServerId(payload.herd_id);
        if (mappedHerdId) {
          payload.herd_id = mappedHerdId;
        }
      }

      // Add idempotency key / local tx ID
      payload.client_tx_id = item.id;

      if (item.entity_type === 'health_report') {
        const res = await createHealthReport(payload);
        serverId = res.case_id || res.id;
        
        // Upload photo if saved locally
        if (record.photo_blob && serverId) {
          try {
            const photoFile = new File([record.photo_blob], record.photo_name || 'photo.jpg', { type: record.photo_blob.type || 'image/jpeg' });
            await uploadCaseAttachment(serverId, photoFile);
          } catch (imgErr) {
            console.error('Failed to upload photo for synced case:', imgErr);
          }
        }
      } else if (item.entity_type === 'mortality_report') {
        const res = await createMortalityReport(payload);
        serverId = res.case_id || res.id;
        
        if (record.photo_blob && serverId) {
          try {
            const photoFile = new File([record.photo_blob], record.photo_name || 'photo.jpg', { type: record.photo_blob.type || 'image/jpeg' });
            await uploadCaseAttachment(serverId, photoFile);
          } catch (imgErr) {
            console.error('Failed to upload photo for synced mortality report:', imgErr);
          }
        }
      } else if (item.entity_type === 'animal') {
        const res = await createAnimal(payload);
        serverId = res.id;
      }

      if (serverId) {
        // Save mapping
        await offlineStore.saveIdMapping(item.id, serverId);
        // Mark record synced
        await offlineStore.updateRecordStatus(item.id, 'synced', serverId);
        // Delete queue item
        await SyncQueue.remove(item.id);
        return true;
      } else {
        throw new Error('No server ID returned');
      }
    } catch (err: any) {
      console.error(`Sync failed for ${item.id}:`, err);
      const errMsg = err?.message || 'Sync failed — will retry later.';
      await SyncQueue.updateStatus(item.id, 'failed', errMsg);
      await offlineStore.updateRecordStatus(item.id, 'failed', undefined, errMsg);
      return false;
    }
  }
}

export const syncService = new SyncService();
