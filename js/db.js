const DB_NAME = 'FavLinkDB';
const DB_VERSION = 1;
const STORE_NAME = 'bookmarks';

export const dbRequest = indexedDB.open(DB_NAME, DB_VERSION);

dbRequest.onupgradeneeded = (e) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
    }
};

dbRequest.onerror = (e) => {
    console.error('Database Error:', e.target.error);
};

export const dbOps = {
    async getAll() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onsuccess = (e) => {
                const db = e.target.result;
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const query = store.getAll();

                query.onsuccess = () => resolve(query.result);
                query.onerror = () => reject(query.error);
            };
        });
    },

    async add(bookmark) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onsuccess = (e) => {
                const db = e.target.result;
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);

                // Ensure ID and timestamp
                const item = {
                    ...bookmark,
                    id: bookmark.id || Date.now(),
                    createdAt: bookmark.createdAt || new Date().toISOString()
                };

                const op = store.add(item);
                op.onsuccess = () => resolve(item);
                op.onerror = () => reject(op.error);
            };
        });
    },

    async update(bookmark) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onsuccess = (e) => {
                const db = e.target.result;
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                const op = store.put(bookmark);

                op.onsuccess = () => resolve(bookmark);
                op.onerror = () => reject(op.error);
            };
        });
    },

    async delete(id) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onsuccess = (e) => {
                const db = e.target.result;
                const tx = db.transaction(STORE_NAME, 'readwrite');
                const store = tx.objectStore(STORE_NAME);
                const op = store.delete(id);

                op.onsuccess = () => resolve(id);
                op.onerror = () => reject(op.error);
            };
        });
    }
};
