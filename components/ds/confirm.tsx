"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

// Confirmation du design system (modale cr-modal) : remplace window.confirm.
// const confirm = useConfirm(); if (!(await confirm({ title, tone: "danger" }))) return;
type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
};

type Pending = ConfirmOptions & { resolve: (ok: boolean) => void };

const ConfirmContext = createContext<((o: ConfirmOptions) => Promise<boolean>) | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback(
    (o: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...o, resolve })),
    []
  );

  const close = useCallback(
    (ok: boolean) => {
      pending?.resolve(ok);
      setPending(null);
    },
    [pending]
  );

  useEffect(() => {
    if (!pending) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pending, close]);

  const danger = pending?.tone !== "default";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending &&
        createPortal(
          <div className="cr-modal-scrim fixed inset-0 z-[100]" onClick={() => close(false)}>
            <div
              className="cr-modal"
              style={{ maxWidth: 460 }}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="cr-confirm-title"
              aria-describedby={pending.description ? "cr-confirm-desc" : undefined}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cr-modal-head">
                {danger && (
                  <span className="cr-icon-tile" style={{ background: "var(--error-50)", color: "var(--error-600)", width: 36, height: 36 }}>
                    <AlertTriangle size={18} aria-hidden="true" />
                  </span>
                )}
                <h4 id="cr-confirm-title">{pending.title}</h4>
                <button type="button" className="cr-iconbtn" aria-label="Fermer" onClick={() => close(false)}>
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              {pending.description && (
                <p id="cr-confirm-desc" style={{ padding: "16px 24px 0", fontSize: 14, lineHeight: "22px", color: "var(--ink-muted)" }}>
                  {pending.description}
                </p>
              )}
              <div className="cr-modal-foot" style={{ borderTop: 0 }}>
                <button ref={cancelRef} type="button" className="cr-btn cr-btn--ghost" onClick={() => close(false)}>
                  {pending.cancelLabel ?? "Annuler"}
                </button>
                <button
                  type="button"
                  className={`cr-btn ${danger ? "cr-btn--danger" : "cr-btn--primary"}`}
                  onClick={() => close(true)}
                >
                  {pending.confirmLabel ?? (danger ? "Supprimer" : "Confirmer")}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  // Hors du provider (pages publiques) : repli sur la confirmation du navigateur.
  return ctx ?? (async (o: ConfirmOptions) => window.confirm(o.description ? `${o.title}\n\n${o.description}` : o.title));
}
