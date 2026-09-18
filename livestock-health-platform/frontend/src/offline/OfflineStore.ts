// OfflineStore.ts - Browser IndexedDB wrapper for offline records

export interface OfflineRecord {
  id: string; // Temporary ID, e.g. LOCAL-HEALTH-1731... or LOCAL-COW-001
  entity_type: 'health_report' | 'mortality_report' | 'animal';
  payload: any;
  photo_blob?: Blob | null;
  photo_name?: string;
  created_at: string;
  sync_status: 'pending' | 'syncing' | 'synced' | 'failed';
  server_id?: string;
  error_message?: string;
}

export interface SyncQueueItem {
  id: string;
  entity_type: 'health_report' | 'mortality_report' | 'animal';
  operation: 'create';
  payload: any;
  created_at: string;
  retry_count: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  error_message?: string;
}

const DB_NAME = 'LivestockOfflineDB';
const DB_VERSION = 1;
const STORE_RECORDS = 'offline_records';
const STORE_QUEUE = 'sync_queue';
const STORE_ID_MAP = 'id_mapping';

class OfflineStore {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_RECORDS)) {
          db.createObjectStore(STORE_RECORDS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_QUEUE)) {
          db.createObjectStore(STORE_QUEUE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_ID_MAP)) {
          db.createObjectStore(STORE_ID_MAP, { keyPath: 'local_id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // --- Records Store ---
  async saveRecord(record: OfflineRecord): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RECORDS, 'readwrite');
      const store = tx.objectStore(STORE_RECORDS);
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getRecord(id: string): Promise<OfflineRecord | undefined> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RECORDS, 'readonly');
      const store = tx.objectStore(STORE_RECORDS);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result as OfflineRecord | undefined);
      req.onerror = () => reject(req.error);
    });
  }

  async getAllRecords(): Promise<OfflineRecord[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RECORDS, 'readonly');
      const store = tx.objectStore(STORE_RECORDS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as OfflineRecord[]);
      req.onerror = () => reject(req.error);
    });
  }

  async updateRecordStatus(id: string, sync_status: OfflineRecord['sync_status'], server_id?: string, error_message?: string): Promise<void> {
    const record = await this.getRecord(id);
    if (record) {
      record.sync_status = sync_status;
      if (server_id) record.server_id = server_id;
      if (error_message !== undefined) record.error_message = error_message;
      await this.saveRecord(record);
    }
  }

  async deleteRecord(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_RECORDS, 'readwrite');
      const store = tx.objectStore(STORE_RECORDS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async clearSyncedRecords(): Promise<void> {
    const records = await this.getAllRecords();
    const synced = records.filter(r => r.sync_status === 'synced');
    for (const r of synced) {
      await this.deleteRecord(r.id);
    }
  }

  // --- Queue Store ---
  async enqueue(item: SyncQueueItem): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_QUEUE, 'readwrite');
      const store = tx.objectStore(STORE_QUEUE);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getQueue(): Promise<SyncQueueItem[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_QUEUE, 'readonly');
      const store = tx.objectStore(STORE_QUEUE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result as SyncQueueItem[]);
      req.onerror = () => reject(req.error);
    });
  }

  async updateQueueItem(item: SyncQueueItem): Promise<void> {
    await this.enqueue(item);
  }

  async deleteQueueItem(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_QUEUE, 'readwrite');
      const store = tx.objectStore(STORE_QUEUE);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- ID Mapping ---
  async saveIdMapping(local_id: string, server_id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ID_MAP, 'readwrite');
      const store = tx.objectStore(STORE_ID_MAP);
      const req = store.put({ local_id, server_id });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getServerId(local_id: string): Promise<string | undefined> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ID_MAP, 'readonly');
      const store = tx.objectStore(STORE_ID_MAP);
      const req = store.get(local_id);
      req.onsuccess = () => resolve(req.result ? req.result.server_id : undefined);
      req.onerror = () => reject(req.error);
    });
  }

  async getAllIdMappings(): Promise<Record<string, string>> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ID_MAP, 'readonly');
      const store = tx.objectStore(STORE_ID_MAP);
      const req = store.getAll();
      req.onsuccess = () => {
        const mappings: Record<string, string> = {};
        (req.result || []).forEach((item: { local_id: string; server_id: string }) => {
          mappings[item.local_id] = item.server_id;
        });
        resolve(mappings);
      };
      req.onerror = () => reject(req.error);
    });
  }
}

export const offlineStore = new OfflineStore();
