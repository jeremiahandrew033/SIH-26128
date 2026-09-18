// SyncQueue.ts - Manager for pending sync operations

import { offlineStore, SyncQueueItem } from './OfflineStore';

export class SyncQueue {
  static async addOperation(
    entity_type: SyncQueueItem['entity_type'],
    payload: any,
    local_id: string
  ): Promise<SyncQueueItem> {
    const item: SyncQueueItem = {
      id: local_id,
      entity_type,
      operation: 'create',
      payload,
      created_at: new Date().toISOString(),
      retry_count: 0,
      status: 'pending'
    };
    await offlineStore.enqueue(item);
    return item;
  }

  static async getPending(): Promise<SyncQueueItem[]> {
    const queue = await offlineStore.getQueue();
    return queue.filter(item => item.status === 'pending' || item.status === 'failed');
  }

  static async updateStatus(id: string, status: SyncQueueItem['status'], error_message?: string): Promise<void> {
    const queue = await offlineStore.getQueue();
    const item = queue.find(i => i.id === id);
    if (item) {
      item.status = status;
      if (error_message !== undefined) item.error_message = error_message;
      if (status === 'failed') item.retry_count += 1;
      await offlineStore.updateQueueItem(item);
    }
  }

  static async remove(id: string): Promise<void> {
    await offlineStore.deleteQueueItem(id);
  }
}
