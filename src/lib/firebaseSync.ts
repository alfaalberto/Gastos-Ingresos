import { doc, onSnapshot, setDoc, Unsubscribe } from "firebase/firestore";
import { getDb } from "./firebase";
import { useFinanceStore } from "@/store/financeStore";

// Estructura del documento de usuario en Firestore: users/{uid}
// Guardamos el snapshot completo del store (transactions, accounts, etc.) en un solo doc.
// Esto es eficiente para apps personales (un solo usuario, datos pequeños) y simple de mantener.

const SNAPSHOT_KEYS = [
  "transactions",
  "accounts",
  "budgets",
  "debts",
  "goals",
  "categories",
  "settings",
] as const;

type SnapshotKey = (typeof SNAPSHOT_KEYS)[number];

function buildSnapshot(state: ReturnType<typeof useFinanceStore.getState>) {
  const out: Record<string, unknown> = {};
  for (const k of SNAPSHOT_KEYS) {
    out[k] = (state as any)[k];
  }
  return out;
}

let writeTimer: ReturnType<typeof setTimeout> | null = null;
let lastUid: string | null = null;
let unsubscribeStore: (() => void) | null = null;
let unsubscribeFirestore: Unsubscribe | null = null;
let applyingRemote = false;

/**
 * Inicia la sincronización bidireccional para el usuario `uid`.
 *  - Escucha cambios remotos de Firestore y los aplica al store local.
 *  - Escucha cambios locales del store y los persiste en Firestore (debounced).
 * Llama a stopSync() al cerrar sesión.
 */
export function startSync(uid: string) {
  const db = getDb();
  if (!db) return;
  if (lastUid === uid && unsubscribeFirestore) return; // ya activa
  stopSync();

  lastUid = uid;
  const ref = doc(db, "users", uid);

  // 1) Suscribirse a cambios remotos
  unsubscribeFirestore = onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      // Primera vez: empujar el estado actual al servidor.
      void setDoc(ref, { ...buildSnapshot(useFinanceStore.getState()), _updatedAt: Date.now() });
      return;
    }
    const data = snap.data() as Record<string, unknown>;
    applyingRemote = true;
    try {
      const patch: Record<string, unknown> = {};
      for (const k of SNAPSHOT_KEYS) {
        if (data[k] !== undefined) patch[k] = data[k];
      }
      useFinanceStore.setState(patch as any, false);
    } finally {
      // Permitir que el siguiente tick local marque cambios sin disparar loop.
      setTimeout(() => { applyingRemote = false; }, 0);
    }
  });

  // 2) Suscribirse a cambios locales (con debounce de 500ms)
  unsubscribeStore = useFinanceStore.subscribe((state) => {
    if (applyingRemote) return;
    if (writeTimer) clearTimeout(writeTimer);
    writeTimer = setTimeout(() => {
      const db2 = getDb();
      if (!db2 || !lastUid) return;
      const ref2 = doc(db2, "users", lastUid);
      void setDoc(ref2, { ...buildSnapshot(state), _updatedAt: Date.now() }, { merge: true });
    }, 500);
  });
}

export function stopSync() {
  if (unsubscribeFirestore) {
    unsubscribeFirestore();
    unsubscribeFirestore = null;
  }
  if (unsubscribeStore) {
    unsubscribeStore();
    unsubscribeStore = null;
  }
  if (writeTimer) {
    clearTimeout(writeTimer);
    writeTimer = null;
  }
  lastUid = null;
}
