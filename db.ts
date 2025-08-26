import { Car, Booking, Transaction, Customer, User, Season, Notification } from './types';

const DB_NAME = 'RentSmartDB';
const DB_VERSION = 1;

// Define store names as an array of strings
export const STORE_NAMES = [
    'cars', 'bookings', 'transactions', 'customers', 'users', 'seasons',
    'companyInfo', 'notificationDays', 'notifications', 'currentUser', 'theme'
];

let dbInstance: IDBDatabase;

// Function to initialize the database
export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (dbInstance) {
            return resolve(dbInstance);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error("IndexedDB error:", request.error);
            reject(new Error("Failed to open IndexedDB"));
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            STORE_NAMES.forEach(name => {
                if (!db.objectStoreNames.contains(name)) {
                    // Stores for arrays of objects usually use 'id' as the keyPath
                    if (['cars', 'bookings', 'transactions', 'customers', 'users', 'seasons', 'notifications'].includes(name)) {
                        db.createObjectStore(name, { keyPath: 'id' });
                    } else {
                        // Stores for single values or objects don't need a keyPath
                        db.createObjectStore(name);
                    }
                }
            });
        };

        request.onsuccess = (event) => {
            dbInstance = (event.target as IDBOpenDBRequest).result;
            resolve(dbInstance);
        };
    });
};

// Generic function to perform a transaction
const performTransaction = <T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest
): Promise<T> => {
    return new Promise((resolve, reject) => {
        if (!dbInstance) {
            return reject(new Error("Database not initialized."));
        }
        const transaction = dbInstance.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const request = operation(store);

        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => reject(request.error);
    });
};

// Public API for database operations
export const getFromDB = <T>(storeName: string, key: IDBValidKey): Promise<T | undefined> =>
    performTransaction<T>(storeName, 'readonly', store => store.get(key));

export const getAllFromDB = <T>(storeName:string): Promise<T[]> =>
    performTransaction<T[]>(storeName, 'readonly', store => store.getAll());
    
export const putToDB = <T>(storeName: string, value: T, key?: IDBValidKey): Promise<IDBValidKey> =>
    performTransaction<IDBValidKey>(storeName, 'readwrite', store => store.put(value, key));

export const deleteFromDB = (storeName: string, key: IDBValidKey): Promise<void> =>
    performTransaction<void>(storeName, 'readwrite', store => store.delete(key));

export const clearStore = (storeName: string): Promise<void> =>
    performTransaction<void>(storeName, 'readwrite', store => store.clear());

// Special function for bulk operations (like import)
export const bulkOperation = (operations: { storeName: string; items: any[]; type: 'put' | 'clear' }[]): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!dbInstance) {
            return reject(new Error("Database not initialized."));
        }
        const storeNames = [...new Set(operations.map(op => op.storeName))];
        const transaction = dbInstance.transaction(storeNames, 'readwrite');
        transaction.oncomplete = () => resolve();
        transaction.onerror = (event) => reject(transaction.error);

        operations.forEach(({ storeName, items, type }) => {
            const store = transaction.objectStore(storeName);
            if (type === 'clear') {
                store.clear();
            }
            if (type === 'put') {
                items.forEach(item => store.put(item));
            }
        });
    });
};