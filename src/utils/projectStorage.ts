import { SavedProject, EditorState, Layer } from '../types';
import { SAMPLE_PROJECTS, INITIAL_EDITOR_STATE } from '../data/sampleProjectsData';

const STORAGE_KEY = 'pixelora_saved_projects_v1';
const DB_NAME = 'pixelora_db';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

// In-memory cache for instantaneous synchronous access
let cachedProjects: SavedProject[] = [];
let isDbInitialized = false;
const listeners = new Set<(projects: SavedProject[]) => void>();

/**
 * Sanitizes a project object so state and layers are guaranteed valid arrays.
 * Strips heavy undo history from storage to eliminate memory inflation.
 */
export function sanitizeProject(raw: any): SavedProject {
  if (!raw || typeof raw !== 'object') {
    return {
      id: 'proj_' + Date.now(),
      name: 'مشروع جديد',
      thumbnail: '',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      width: 1080,
      height: 1080,
      layersCount: 0,
      state: { ...INITIAL_EDITOR_STATE, layers: [] },
    };
  }

  const rawState = raw.state || {};
  const safeLayers: Layer[] = Array.isArray(rawState.layers)
    ? rawState.layers
    : Array.isArray(raw.layers)
    ? raw.layers
    : [];

  const width = Number(raw.width || rawState.canvasWidth) || 1080;
  const height = Number(raw.height || rawState.canvasHeight) || 1080;
  const name = String(raw.name || rawState.projectName || 'مشروع جديد');

  const cleanState: EditorState = {
    ...INITIAL_EDITOR_STATE,
    ...rawState,
    projectName: name,
    canvasWidth: width,
    canvasHeight: height,
    layers: safeLayers,
    history: [], // NEVER keep history in persistent storage (cuts size by 95%)
    historyIndex: -1,
  };

  return {
    id: String(raw.id || 'proj_' + Date.now()),
    name,
    thumbnail: typeof raw.thumbnail === 'string' ? raw.thumbnail : '',
    updatedAt: String(raw.updatedAt || new Date().toISOString()),
    createdAt: String(raw.createdAt || new Date().toISOString()),
    width,
    height,
    layersCount: safeLayers.length,
    state: cleanState,
  };
}

/**
 * Compresses an image or large dataURL into a tiny lightweight thumbnail (max 160x160).
 */
export async function createCompactThumbnail(sourceUrl: string, maxDim: number = 160): Promise<string> {
  if (!sourceUrl) return '';
  // If it's a web URL or already small string, keep as is
  if (!sourceUrl.startsWith('data:image')) {
    return sourceUrl;
  }
  // If it's a small data url, return it directly
  if (sourceUrl.length < 30000) {
    return sourceUrl;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1);
          canvas.width = Math.max(1, Math.round(img.width * ratio));
          canvas.height = Math.max(1, Math.round(img.height * ratio));
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.65));
            return;
          }
        } catch {
          // fallback
        }
        resolve(sourceUrl.slice(0, 1000));
      };
      img.onerror = () => resolve('');
      img.src = sourceUrl;
    } catch {
      resolve('');
    }
  });
}

/**
 * Open IndexedDB database with fallback support
 */
function openIndexedDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        console.warn('IndexedDB unavailable, using localStorage fallback');
        resolve(null);
      };
    } catch (err) {
      console.warn('Failed to open IndexedDB:', err);
      resolve(null);
    }
  });
}

/**
 * Synchronous initial population from localStorage + sample projects
 */
function initSyncCache(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedProjects = parsed.map(sanitizeProject);
        return;
      }
    }
  } catch {
    // Ignore corrupted localStorage
  }
  const fallback = Array.isArray(SAMPLE_PROJECTS) ? SAMPLE_PROJECTS : [];
  cachedProjects = fallback.map(sanitizeProject);
}

// Populate immediate sync cache on load
initSyncCache();

/**
 * Initialize IndexedDB and sync projects
 */
async function initStorageEngine(): Promise<void> {
  if (isDbInitialized) return;
  isDbInitialized = true;

  try {
    const db = await openIndexedDB();
    if (!db) return;

    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const getAllReq = store.getAll();

    getAllReq.onsuccess = () => {
      const dbProjects = getAllReq.result as SavedProject[];
      if (Array.isArray(dbProjects) && dbProjects.length > 0) {
        // Merge with existing sample projects if needed
        const sanitized = dbProjects.map(sanitizeProject);
        cachedProjects = sanitized;
        notifySubscribers();
      } else {
        // First run: migrate current cached/sample projects into IndexedDB
        const writeTx = db.transaction(STORE_NAME, 'readwrite');
        const writeStore = writeTx.objectStore(STORE_NAME);
        cachedProjects.forEach((p) => {
          writeStore.put(sanitizeProject(p));
        });
      }
    };
  } catch (err) {
    console.warn('Error during storage engine sync:', err);
  }
}

// Start async initialization in background
if (typeof window !== 'undefined') {
  setTimeout(() => {
    initStorageEngine();
  }, 10);
}

function notifySubscribers() {
  listeners.forEach((listener) => {
    try {
      listener([...cachedProjects]);
    } catch (e) {
      console.error(e);
    }
  });
}

/**
 * Subscribe to project storage changes
 */
export function subscribeToProjects(listener: (projects: SavedProject[]) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Safely persists projects into localStorage without crashing when quota is exceeded
 */
function safeSaveToLocalStorage(projects: SavedProject[]): void {
  try {
    // 1. Try full save
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch (quotaError) {
    // 2. Quota exceeded: prune to only latest 2 projects or strip heavy image layers from localStorage
    try {
      console.warn('[Pixelora Storage] LocalStorage quota reached. Pruning cache; full project safely kept in IndexedDB.');
      const lightweight = projects.slice(0, 3).map((p) => ({
        ...p,
        thumbnail: p.thumbnail && p.thumbnail.length > 10000 ? '' : p.thumbnail,
        state: {
          ...p.state,
          history: [],
          layers: (p.state?.layers || []).map((l) => ({
            ...l,
            source: l.source && l.source.length > 100000 ? '' : l.source,
          })),
        },
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweight));
    } catch {
      // If even 3 lightweight projects exceed quota, keep only metadata
      try {
        const metadataOnly = projects.map(({ id, name, updatedAt, createdAt, width, height, layersCount }) => ({
          id,
          name,
          thumbnail: '',
          updatedAt,
          createdAt,
          width,
          height,
          layersCount,
          state: { ...INITIAL_EDITOR_STATE, layers: [] },
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(metadataOnly));
      } catch {
        // Silently tolerate if localStorage is completely locked by host
      }
    }
  }
}

/**
 * Synchronous getter for saved projects (guarantees safe layers and structure)
 */
export function getSavedProjects(): SavedProject[] {
  if (!cachedProjects || cachedProjects.length === 0) {
    initSyncCache();
  }
  return cachedProjects.map(sanitizeProject);
}

/**
 * Saves a project reliably using IndexedDB as primary store and quota-safe localStorage as fallback
 */
export async function saveProjectToStorage(project: SavedProject): Promise<void> {
  const sanitized = sanitizeProject(project);

  // If thumbnail is a heavy base64 data URL, downsample it to a compact lightweight thumbnail
  if (sanitized.thumbnail && sanitized.thumbnail.startsWith('data:image') && sanitized.thumbnail.length > 30000) {
    try {
      sanitized.thumbnail = await createCompactThumbnail(sanitized.thumbnail, 160);
    } catch {
      // keep original if downscaling fails
    }
  }

  // Update in-memory cache immediately
  const existingIdx = cachedProjects.findIndex((p) => p.id === sanitized.id);
  if (existingIdx >= 0) {
    cachedProjects[existingIdx] = { ...sanitized, updatedAt: new Date().toISOString() };
  } else {
    cachedProjects = [sanitized, ...cachedProjects];
  }

  // Persist to IndexedDB (asynchronous, high quota, up to gigabytes)
  try {
    const db = await openIndexedDB();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(sanitized);
    }
  } catch (err) {
    console.warn('Could not save to IndexedDB:', err);
  }

  // Safe fallback to localStorage
  safeSaveToLocalStorage(cachedProjects);
  notifySubscribers();
}

/**
 * Deletes a project from both memory, IndexedDB, and localStorage
 */
export function deleteProjectFromStorage(projectId: string): SavedProject[] {
  cachedProjects = cachedProjects.filter((p) => p.id !== projectId);

  // Delete from IndexedDB
  openIndexedDB().then((db) => {
    if (db) {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(projectId);
      } catch (err) {
        console.warn('Could not delete from IndexedDB:', err);
      }
    }
  });

  // Delete from localStorage
  safeSaveToLocalStorage(cachedProjects);
  notifySubscribers();

  return cachedProjects.map(sanitizeProject);
}
