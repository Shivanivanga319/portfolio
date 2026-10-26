// Client-side Resume Storage (IndexedDB)
// Ensures uploaded resume works seamlessly on local machines and static hosts (like Vercel)
const DB_NAME = 'portfolio_resume_db';
const STORE_NAME = 'resume_files';

function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLocalResume(file) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(file, 'activeResume');
      req.onsuccess = () => {
        localStorage.setItem(
          'localResumeMeta',
          JSON.stringify({
            filename: file.name,
            sizeBytes: file.size,
            updatedAt: new Date().toISOString(),
          })
        );
        resolve(true);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not save resume to IndexedDB:', err);
    return false;
  }
}

export async function getLocalResume() {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get('activeResume');
      req.onsuccess = () => {
        if (req.result) {
          const blobUrl = URL.createObjectURL(req.result);
          const metaRaw = localStorage.getItem('localResumeMeta');
          const meta = metaRaw ? JSON.parse(metaRaw) : null;
          resolve({
            exists: true,
            downloadUrl: blobUrl,
            sizeBytes: meta?.sizeBytes || req.result.size,
            updatedAt: meta?.updatedAt || new Date().toISOString(),
            isLocal: true,
          });
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
}
