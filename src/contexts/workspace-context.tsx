"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { FREE_WORKSPACE_LIMIT, WORKSPACE_COLORS, type Workspace } from "@/types/workspace";

// Fixed ID for the auto-created default workspace.
// Using setDoc with a deterministic ID makes bootstrap idempotent —
// concurrent calls (React strict-mode double-mount, network retry) are safe.
const DEFAULT_WS_ID = "default";

type WorkspaceContextValue = {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string) => void;
  addWorkspace: (name: string, color?: string) => Promise<Workspace | null>;
  renameWorkspace: (id: string, name: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  loading: boolean;
  canCreateMore: boolean;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

// Safe fallback so components outside the provider never throw.
const fallback: WorkspaceContextValue = {
  workspaces: [],
  activeWorkspace: null,
  activeWorkspaceId: null,
  setActiveWorkspaceId: () => {},
  addWorkspace: async () => null,
  renameWorkspace: async () => {},
  deleteWorkspace: async () => {},
  loading: false,
  canCreateMore: true,
};

export function useWorkspace(): WorkspaceContextValue {
  return useContext(WorkspaceContext) ?? fallback;
}

// ─── localStorage helpers ───────────────────────────────────────────────────

function storageKey(userId: string) {
  return `roznaamcha-ws-${userId}`;
}

function migrationKey(userId: string) {
  return `roznaamcha-ws-migrated-${userId}`;
}

// ─── One-time migration ──────────────────────────────────────────────────────

// Assigns the default workspaceId to all pre-existing transactions that were
// created before the workspace system existed.  The localStorage flag makes
// this a true one-shot: even if the function is called twice concurrently
// (strict mode), only one pass runs to completion and sets the flag; the
// second pass exits early at the top.  Batch writes are idempotent: writing
// the same workspaceId twice causes no harm.
async function migrateExistingTransactions(
  userId: string,
  defaultWorkspaceId: string,
): Promise<void> {
  if (localStorage.getItem(migrationKey(userId))) return;

  try {
    const allTx = await getDocs(collection(db, "users", userId, "transactions"));
    const toMigrate = allTx.docs.filter((d) => !d.data().workspaceId);

    const CHUNK = 400;
    for (let i = 0; i < toMigrate.length; i += CHUNK) {
      const batch = writeBatch(db);
      toMigrate.slice(i, i + CHUNK).forEach((d) =>
        batch.update(d.ref, { workspaceId: defaultWorkspaceId }),
      );
      await batch.commit();
    }

    // Mark migration complete only on success so a failed run retries next time.
    localStorage.setItem(migrationKey(userId), "1");
  } catch {
    // Non-fatal.  Pre-migration transactions will be invisible until a
    // successful migration run assigns them a workspaceId.
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.uid;

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Prevents the bootstrap branch from running twice within the same
  // effect lifecycle (e.g. two rapid onSnapshot fires before the addDoc
  // response arrives).
  const bootstrappingRef = useRef(false);

  useEffect(() => {
    if (!userId) {
      setWorkspaces([]);
      setActiveIdState(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    bootstrappingRef.current = false;

    const wsCollection = collection(db, "users", userId, "workspaces");

    const unsubscribe = onSnapshot(
      query(wsCollection, orderBy("createdAt", "asc")),
      (snapshot) => {
        const loaded: Workspace[] = snapshot.docs.map((d) => ({
          id: d.id,
          name: String(d.data().name || "Workspace"),
          color: String(d.data().color || WORKSPACE_COLORS[0]),
          createdAt:
            d.data().createdAt?.toDate?.()?.toISOString() ??
            new Date().toISOString(),
        }));

        if (loaded.length === 0 && !bootstrappingRef.current) {
          // ── First-time user: create the default workspace ──────────────
          // setDoc with a fixed ID + { merge: true } is idempotent, so
          // concurrent calls (React strict-mode double-mount, page reload
          // mid-flight) produce exactly one document without errors.
          bootstrappingRef.current = true;

          setDoc(
            doc(wsCollection, DEFAULT_WS_ID),
            { name: "Personal", color: WORKSPACE_COLORS[0], createdAt: serverTimestamp() },
            { merge: true },
          )
            .then(() => migrateExistingTransactions(userId, DEFAULT_WS_ID))
            .catch(() => {
              bootstrappingRef.current = false;
              setLoading(false);
            });
          // onSnapshot fires again once the doc lands — loading clears there.
          return;
        }

        if (loaded.length > 0) {
          bootstrappingRef.current = false;
          setWorkspaces(loaded);

          // Restore last active workspace; fall back to the first one.
          const stored = localStorage.getItem(storageKey(userId));
          const validId =
            stored && loaded.some((w) => w.id === stored)
              ? stored
              : loaded[0].id;

          setActiveIdState(validId);
          if (validId !== stored) {
            localStorage.setItem(storageKey(userId), validId);
          }
          setLoading(false);
        }
      },
      () => {
        // Snapshot error (e.g. no Firestore rules yet) — stop loading.
        setLoading(false);
      },
    );

    return () => {
      unsubscribe();
      // Reset so the next effect run starts fresh.
      bootstrappingRef.current = false;
    };
  }, [userId]);

  // ─── Public API ─────────────────────────────────────────────────────────

  const setActiveWorkspaceId = useCallback(
    (id: string) => {
      setActiveIdState(id);
      if (userId) localStorage.setItem(storageKey(userId), id);
    },
    [userId],
  );

  const addWorkspace = useCallback(
    async (name: string, color?: string): Promise<Workspace | null> => {
      if (!userId || workspaces.length >= FREE_WORKSPACE_LIMIT) return null;

      const chosenColor =
        color ?? WORKSPACE_COLORS[workspaces.length % WORKSPACE_COLORS.length];

      const ref = await addDoc(collection(db, "users", userId, "workspaces"), {
        name: name.trim(),
        color: chosenColor,
        createdAt: serverTimestamp(),
      });

      return {
        id: ref.id,
        name: name.trim(),
        color: chosenColor,
        createdAt: new Date().toISOString(),
      };
    },
    [userId, workspaces],
  );

  const renameWorkspace = useCallback(
    async (id: string, name: string) => {
      if (!userId || !name.trim()) return;
      await updateDoc(doc(db, "users", userId, "workspaces", id), {
        name: name.trim(),
      });
    },
    [userId],
  );

  const deleteWorkspace = useCallback(
    async (id: string) => {
      if (!userId || workspaces.length <= 1) return;

      // Delete all transactions that belong to this workspace, in chunks of 400
      // to stay under Firestore's 500-operation batch limit.
      const txSnap = await getDocs(
        query(
          collection(db, "users", userId, "transactions"),
          where("workspaceId", "==", id),
        ),
      );

      const CHUNK = 400;
      for (let i = 0; i < txSnap.docs.length; i += CHUNK) {
        const batch = writeBatch(db);
        txSnap.docs.slice(i, i + CHUNK).forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }

      // Switch the active workspace BEFORE removing the doc so the UI never
      // briefly renders with an ID that no longer exists in Firestore.
      if (activeWorkspaceId === id) {
        const next = workspaces.find((w) => w.id !== id);
        if (next) setActiveWorkspaceId(next.id);
      }

      await deleteDoc(doc(db, "users", userId, "workspaces", id));
    },
    [userId, workspaces, activeWorkspaceId, setActiveWorkspaceId],
  );

  // ─────────────────────────────────────────────────────────────────────────

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) ?? null;

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        activeWorkspaceId,
        setActiveWorkspaceId,
        addWorkspace,
        renameWorkspace,
        deleteWorkspace,
        loading,
        canCreateMore: workspaces.length < FREE_WORKSPACE_LIMIT,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
