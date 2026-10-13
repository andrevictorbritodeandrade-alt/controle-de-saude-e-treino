import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { User } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

const QUOTA_PAUSE_KEY = 'firestore_quota_paused_until';

export function isQuotaExhausted(): boolean {
  try {
    const pausedUntil = localStorage.getItem(QUOTA_PAUSE_KEY);
    if (!pausedUntil) {
      // Default to quota exhausted mode on free tier to prevent quota errors entirely
      localStorage.setItem(QUOTA_PAUSE_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
      return true;
    }
    const time = Number(pausedUntil);
    if (Date.now() < time) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

export function markQuotaExhausted(): void {
  try {
    const pauseTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem(QUOTA_PAUSE_KEY, String(pauseTime));
  } catch (e) {
    // ignore
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  markQuotaExhausted();
}

// Local cache helper
function setLocalCache(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Erro ao salvar cache local:', e);
  }
}

function getLocalCache(key: string): any | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const saveUserData = async (user: User) => {
  const path = `users/${user.id}`;
  const { password, ...userData } = user;
  setLocalCache(`cache_${path}`, userData);
};

export const getUserData = async (userId: string): Promise<User | null> => {
  const path = `users/${userId}`;
  return getLocalCache(`cache_${path}`) as User | null;
};

export const saveDailyLog = async (userId: string, date: string, data: any) => {
  const path = `users/${userId}/dailyLogs/${date}`;
  setLocalCache(`cache_${path}`, data);
};

export const subscribeToDailyLog = (userId: string, date: string, callback: (data: any) => void) => {
  const path = `users/${userId}/dailyLogs/${date}`;
  const cached = getLocalCache(`cache_${path}`);
  if (cached) {
    callback(cached);
  }
  return () => {};
};

export const subscribeToUserData = (userId: string, callback: (data: any) => void) => {
  const path = `users/${userId}`;
  const cached = getLocalCache(`cache_${path}`);
  if (cached) {
    callback(cached);
  }
  return () => {};
};

export const saveProgressData = async (userId: string, data: any) => {
  const path = `users/${userId}/progress/main`;
  const existing = getLocalCache(`cache_${path}`) || {};
  const merged = { ...existing, ...data };
  setLocalCache(`cache_${path}`, merged);
};

export const subscribeToProgressData = (userId: string, callback: (data: any) => void) => {
  const path = `users/${userId}/progress/main`;
  const cached = getLocalCache(`cache_${path}`);
  if (cached) {
    callback(cached);
  }
  return () => {};
};

export const savePoviztraData = async (userId: string, data: any) => {
  const path = `users/${userId}/poviztra/main`;
  setLocalCache(`cache_${path}`, data);
};

export const subscribeToPoviztraData = (userId: string, callback: (data: any) => void) => {
  const path = `users/${userId}/poviztra/main`;
  const cached = getLocalCache(`cache_${path}`);
  if (cached) {
    callback(cached);
  }
  return () => {};
};
