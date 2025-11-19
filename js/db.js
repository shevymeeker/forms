/**
 * IndexedDB Manager - Handles all offline data storage
 * Stores: company branding, form templates, client responses, analytics
 */

const DB_NAME = 'FormBuilderDB';
const DB_VERSION = 1;

class Database {
  constructor() {
    this.db = null;
  }

  /**
   * Initialize the database
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('[DB] Database initialized successfully');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Company branding store
        if (!db.objectStoreNames.contains('branding')) {
          const brandingStore = db.createObjectStore('branding', { keyPath: 'id' });
          console.log('[DB] Created branding store');
        }

        // Form templates store
        if (!db.objectStoreNames.contains('templates')) {
          const templatesStore = db.createObjectStore('templates', {
            keyPath: 'id',
            autoIncrement: true
          });
          templatesStore.createIndex('name', 'name', { unique: false });
          templatesStore.createIndex('createdAt', 'createdAt', { unique: false });
          console.log('[DB] Created templates store');
        }

        // Client responses store
        if (!db.objectStoreNames.contains('responses')) {
          const responsesStore = db.createObjectStore('responses', {
            keyPath: 'id',
            autoIncrement: true
          });
          responsesStore.createIndex('templateId', 'templateId', { unique: false });
          responsesStore.createIndex('clientName', 'clientName', { unique: false });
          responsesStore.createIndex('submittedAt', 'submittedAt', { unique: false });
          console.log('[DB] Created responses store');
        }

        // Analytics store
        if (!db.objectStoreNames.contains('analytics')) {
          const analyticsStore = db.createObjectStore('analytics', {
            keyPath: 'id',
            autoIncrement: true
          });
          analyticsStore.createIndex('eventType', 'eventType', { unique: false });
          analyticsStore.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('[DB] Created analytics store');
        }

        // Backup queue store (for syncing when online)
        if (!db.objectStoreNames.contains('backupQueue')) {
          const backupStore = db.createObjectStore('backupQueue', {
            keyPath: 'id',
            autoIncrement: true
          });
          backupStore.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('[DB] Created backup queue store');
        }
      };
    });
  }

  /**
   * Generic method to add data to a store
   */
  async add(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic method to update data in a store
   */
  async put(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic method to get data by key
   */
  async get(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic method to get all data from a store
   */
  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic method to delete data by key
   */
  async delete(storeName, key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get data by index
   */
  async getByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Specific helper methods for common operations

  /**
   * Save or update company branding
   */
  async saveBranding(brandingData) {
    const data = {
      id: 'company',
      ...brandingData,
      updatedAt: new Date().toISOString()
    };
    return this.put('branding', data);
  }

  /**
   * Get company branding
   */
  async getBranding() {
    return this.get('branding', 'company');
  }

  /**
   * Save a form template
   */
  async saveTemplate(template) {
    const data = {
      ...template,
      createdAt: template.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (template.id) {
      return this.put('templates', data);
    } else {
      return this.add('templates', data);
    }
  }

  /**
   * Get all templates
   */
  async getAllTemplates() {
    return this.getAll('templates');
  }

  /**
   * Get a specific template
   */
  async getTemplate(id) {
    return this.get('templates', id);
  }

  /**
   * Delete a template
   */
  async deleteTemplate(id) {
    return this.delete('templates', id);
  }

  /**
   * Save a client response
   */
  async saveResponse(response) {
    const data = {
      ...response,
      submittedAt: response.submittedAt || new Date().toISOString()
    };

    if (response.id) {
      return this.put('responses', data);
    } else {
      return this.add('responses', data);
    }
  }

  /**
   * Get all responses
   */
  async getAllResponses() {
    return this.getAll('responses');
  }

  /**
   * Get responses for a specific template
   */
  async getResponsesByTemplate(templateId) {
    return this.getByIndex('responses', 'templateId', templateId);
  }

  /**
   * Get a specific response
   */
  async getResponse(id) {
    return this.get('responses', id);
  }

  /**
   * Delete a response
   */
  async deleteResponse(id) {
    return this.delete('responses', id);
  }

  /**
   * Log an analytics event
   */
  async logEvent(eventType, eventData = {}) {
    const event = {
      eventType,
      data: eventData,
      timestamp: new Date().toISOString()
    };
    return this.add('analytics', event);
  }

  /**
   * Get all analytics events
   */
  async getAllAnalytics() {
    return this.getAll('analytics');
  }

  /**
   * Get analytics by event type
   */
  async getAnalyticsByType(eventType) {
    return this.getByIndex('analytics', 'eventType', eventType);
  }

  /**
   * Add item to backup queue
   */
  async queueForBackup(data) {
    const item = {
      ...data,
      timestamp: new Date().toISOString()
    };
    return this.add('backupQueue', item);
  }

  /**
   * Get all items in backup queue
   */
  async getBackupQueue() {
    return this.getAll('backupQueue');
  }

  /**
   * Clear backup queue
   */
  async clearBackupQueue() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['backupQueue'], 'readwrite');
      const store = transaction.objectStore('backupQueue');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Export all data as JSON (for backup)
   */
  async exportAllData() {
    const data = {
      branding: await this.getBranding(),
      templates: await this.getAllTemplates(),
      responses: await this.getAllResponses(),
      analytics: await this.getAllAnalytics(),
      exportedAt: new Date().toISOString()
    };
    return data;
  }

  /**
   * Import data from JSON backup
   */
  async importData(data) {
    try {
      if (data.branding) {
        await this.saveBranding(data.branding);
      }

      if (data.templates && Array.isArray(data.templates)) {
        for (const template of data.templates) {
          await this.saveTemplate(template);
        }
      }

      if (data.responses && Array.isArray(data.responses)) {
        for (const response of data.responses) {
          await this.saveResponse(response);
        }
      }

      return true;
    } catch (error) {
      console.error('[DB] Import failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const db = new Database();

// Export for use in other modules
window.DB = db;
