// Storage service using IndexedDB
class StorageService {
    constructor() {
        this.dbName = 'ConsultingDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('customers')) {
                    const customerStore = db.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });
                    customerStore.createIndex('companyName', 'companyName', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('forms')) {
                    const formStore = db.createObjectStore('forms', { keyPath: 'id', autoIncrement: true });
                    formStore.createIndex('title', 'title', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('templates')) {
                    const templateStore = db.createObjectStore('templates', { keyPath: 'id', autoIncrement: true });
                    templateStore.createIndex('title', 'title', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('responses')) {
                    const responseStore = db.createObjectStore('responses', { keyPath: 'id', autoIncrement: true });
                    responseStore.createIndex('customerId', 'customerId', { unique: false });
                    responseStore.createIndex('formId', 'formId', { unique: false });
                }
            };
        });
    }

    async addCustomer(customer) {
        const transaction = this.db.transaction(['customers'], 'readwrite');
        const store = transaction.objectStore('customers');
        return store.add(customer);
    }

    async getAllCustomers() {
        const transaction = this.db.transaction(['customers'], 'readonly');
        const store = transaction.objectStore('customers');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteCustomer(id) {
        const transaction = this.db.transaction(['customers'], 'readwrite');
        const store = transaction.objectStore('customers');
        return store.delete(id);
    }

    async addForm(form) {
        const transaction = this.db.transaction(['forms'], 'readwrite');
        const store = transaction.objectStore('forms');
        return store.add(form);
    }

    async getAllForms() {
        const transaction = this.db.transaction(['forms'], 'readonly');
        const store = transaction.objectStore('forms');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async addTemplate(template) {
        const transaction = this.db.transaction(['templates'], 'readwrite');
        const store = transaction.objectStore('templates');
        return store.add(template);
    }

    async getAllTemplates() {
        const transaction = this.db.transaction(['templates'], 'readonly');
        const store = transaction.objectStore('templates');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async addResponse(response) {
        const transaction = this.db.transaction(['responses'], 'readwrite');
        const store = transaction.objectStore('responses');
        return store.add(response);
    }

    async getResponsesByCustomer(customerId) {
        const transaction = this.db.transaction(['responses'], 'readonly');
        const store = transaction.objectStore('responses');
        const index = store.index('customerId');
        return new Promise((resolve, reject) => {
            const request = index.getAll(customerId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// Global storage instance
const storageService = new StorageService();