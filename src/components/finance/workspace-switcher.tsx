"use client";

import { Check, ChevronDown, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "@/contexts/workspace-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { FREE_WORKSPACE_LIMIT, WORKSPACE_COLORS } from "@/types/workspace";

export function WorkspaceSwitcher() {
  const {
    workspaces,
    activeWorkspace,
    activeWorkspaceId,
    setActiveWorkspaceId,
    addWorkspace,
    renameWorkspace,
    deleteWorkspace,
    canCreateMore,
  } = useWorkspace();

  const [modalOpen, setModalOpen] = useState(false);

  // ── Create state ───────────────────────────────────────────────────────────
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createColor, setCreateColor] = useState<string>(WORKSPACE_COLORS[0]);
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState("");

  // ── Rename state ───────────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [renameBusy, setRenameBusy] = useState(false);
  const [renameError, setRenameError] = useState("");

  // ── Delete state ───────────────────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const resetCreateForm = () => {
    setCreating(false);
    setCreateName("");
    setCreateColor(WORKSPACE_COLORS[0]);
    setCreateError("");
  };

  const closeModal = () => {
    setModalOpen(false);
    resetCreateForm();
    setEditingId(null);
    setRenameError("");
  };

  const handleSwitch = (id: string) => {
    setActiveWorkspaceId(id);
    closeModal();
  };

  // ── Rename ─────────────────────────────────────────────────────────────────

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
    setRenameError("");
    resetCreateForm();
  };

  const handleRename = async () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      setRenameError("Name cannot be empty.");
      return;
    }
    if (
      workspaces.some(
        (w) => w.id !== editingId && w.name.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      setRenameError("A workspace with this name already exists.");
      return;
    }
    setRenameBusy(true);
    try {
      await renameWorkspace(editingId!, trimmed);
      setEditingId(null);
      setRenameError("");
    } finally {
      setRenameBusy(false);
    }
  };

  // ── Create ─────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    const name = createName.trim();
    if (!name) {
      setCreateError("Please enter a workspace name.");
      return;
    }
    if (workspaces.some((w) => w.name.toLowerCase() === name.toLowerCase())) {
      setCreateError("A workspace with this name already exists.");
      return;
    }
    setCreateBusy(true);
    setCreateError("");
    try {
      const ws = await addWorkspace(name, createColor);
      if (ws) {
        setActiveWorkspaceId(ws.id);
        resetCreateForm();
        setModalOpen(false);
      }
    } finally {
      setCreateBusy(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleteBusy(true);
    try {
      await deleteWorkspace(deletingId);
      setDeletingId(null);
      // Close the workspace manager modal after a successful deletion so the
      // user lands cleanly on the dashboard of their new active workspace.
      setModalOpen(false);
    } finally {
      setDeleteBusy(false);
    }
  };

  const deletingWorkspace = workspaces.find((w) => w.id === deletingId);
  const deletingTxWarning =
    `"${deletingWorkspace?.name ?? "This workspace"}" and all its transactions ` +
    `will be permanently deleted. This action cannot be undone.`;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Sidebar trigger ── */}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        aria-label="Manage workspaces"
        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-panel-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: activeWorkspace?.color ?? WORKSPACE_COLORS[0] }}
          aria-hidden="true"
        />
        <span className="flex-1 truncate text-left font-medium">
          {activeWorkspace?.name ?? "Loading…"}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
      </button>

      {/* ── Workspace manager modal ── */}
      <Modal
        open={modalOpen}
        title={`Workspaces (${workspaces.length} / ${FREE_WORKSPACE_LIMIT})`}
        onClose={closeModal}
        className="max-w-sm"
      >
        <div className="grid gap-2">

          {/* ── Workspace list ── */}
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className={cn(
                "flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 transition-colors",
                ws.id === activeWorkspaceId && "border-primary/40 bg-primary/10",
              )}
            >
              {/* Color dot */}
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ background: ws.color }}
                aria-hidden="true"
              />

              {editingId === ws.id ? (
                /* ── Inline rename form ── */
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={editName}
                      onChange={(e) => {
                        setEditName(e.target.value);
                        setRenameError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename();
                        if (e.key === "Escape") {
                          setEditingId(null);
                          setRenameError("");
                        }
                      }}
                      className="h-7 py-0 text-xs"
                      maxLength={30}
                      autoFocus
                    />
                    <Button
                      type="button"
                      className="h-7 px-2.5 text-xs"
                      onClick={handleRename}
                      disabled={renameBusy || !editName.trim()}
                    >
                      {renameBusy ? "…" : "Save"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-7 w-7 px-0"
                      onClick={() => {
                        setEditingId(null);
                        setRenameError("");
                      }}
                      aria-label="Cancel rename"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {renameError && (
                    <p className="text-[11px] text-expense">{renameError}</p>
                  )}
                </div>
              ) : (
                /* ── Normal row ── */
                <>
                  <button
                    type="button"
                    className="flex-1 truncate text-left text-sm font-medium"
                    onClick={() => handleSwitch(ws.id)}
                    aria-current={ws.id === activeWorkspaceId ? "true" : undefined}
                  >
                    {ws.name}
                  </button>

                  {ws.id === activeWorkspaceId && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 px-0"
                    onClick={() => handleStartEdit(ws.id, ws.name)}
                    aria-label={`Rename ${ws.name}`}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>

                  {/* Delete is hidden when this is the only workspace */}
                  {workspaces.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-7 w-7 shrink-0 px-0 text-expense hover:text-expense"
                      onClick={() => setDeletingId(ws.id)}
                      aria-label={`Delete ${ws.name}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </>
              )}
            </div>
          ))}

          {/* ── Create / limit ── */}
          {creating ? (
            <div className="mt-1 rounded-lg border border-dashed border-border p-3">
              <p className="mb-2 text-xs font-semibold text-muted">New workspace</p>

              <Input
                value={createName}
                onChange={(e) => {
                  setCreateName(e.target.value);
                  setCreateError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") resetCreateForm();
                }}
                placeholder="e.g. Office Expenses"
                autoFocus
                maxLength={30}
                className="mb-1"
              />
              {createError && (
                <p className="mb-2 text-[11px] text-expense">{createError}</p>
              )}

              {/* Color picker */}
              <div className="mb-3 mt-2 flex items-center gap-2">
                <span className="text-xs text-muted">Color:</span>
                {WORKSPACE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    aria-label={`Pick color ${color}`}
                    aria-pressed={createColor === color}
                    className={cn(
                      "h-5 w-5 rounded-full border-2 transition-transform",
                      createColor === color
                        ? "scale-125 border-foreground"
                        : "border-transparent hover:scale-110",
                    )}
                    style={{ background: color }}
                    onClick={() => setCreateColor(color)}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  className="h-8 flex-1 text-sm"
                  onClick={handleCreate}
                  disabled={createBusy || !createName.trim()}
                >
                  {createBusy ? "Creating…" : "Create workspace"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8"
                  onClick={resetCreateForm}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : canCreateMore ? (
            <button
              type="button"
              onClick={() => {
                resetCreateForm();
                setCreating(true);
                setEditingId(null);
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create new workspace
            </button>
          ) : (
            /* ── Free plan limit reached ── */
            <div className="mt-1 rounded-lg border border-warning/40 bg-warning/10 p-3">
              <p className="text-sm font-semibold text-warning">Free plan limit reached</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                You can create up to {FREE_WORKSPACE_LIMIT} workspaces for free.
                Upgrade your plan to create more workspaces.
              </p>
            </div>
          )}

          {/* Workspace usage counter */}
          <p className="text-center text-[10px] text-muted/60">
            {workspaces.length} / {FREE_WORKSPACE_LIMIT} workspaces used
          </p>
        </div>
      </Modal>

      {/* ── Delete confirmation ── */}
      <ConfirmDialog
        open={Boolean(deletingId)}
        title="Delete workspace"
        description={deletingTxWarning}
        confirmLabel="Delete workspace"
        busy={deleteBusy}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
