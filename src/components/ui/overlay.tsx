"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

function useOverlay(open: boolean, onClose: () => void, panelRef: RefObject<HTMLElement | null>) {
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => panelRef.current?.focus(), 40);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const nodes = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((node) => node.offsetParent !== null || node === document.activeElement);

      if (nodes.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      restoreRef.current?.focus?.();
    };
  }, [open, onClose, panelRef]);
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
  hideClose = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  hideClose?: boolean;
}) {
  const mounted = useMounted();
  const panelRef = useRef<HTMLDivElement>(null);
  useOverlay(open, onClose, panelRef);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto p-4 pb-10 pt-[12vh] sm:pt-[14vh]">
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title ? undefined : "Dialog"}
            aria-labelledby={title ? "overlay-title" : undefined}
            aria-describedby={description ? "overlay-description" : undefined}
            tabIndex={-1}
            className={cn(
              "relative z-10 w-full max-w-lg rounded-2xl border border-line bg-card p-6 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)] outline-none sm:p-7",
              className,
            )}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.99 }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            {!hideClose ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-subtle transition-colors hover:bg-white/5 hover:text-content"
              >
                <X className="size-4" />
              </button>
            ) : null}
            {title ? (
              <h2
                id="overlay-title"
                className="pr-8 text-lg font-medium tracking-tight text-content"
              >
                {title}
              </h2>
            ) : null}
            {description ? (
              <p
                id="overlay-description"
                className="mt-1.5 text-sm leading-relaxed text-muted"
              >
                {description}
              </p>
            ) : null}
            <div className={cn(title || description ? "mt-5" : undefined)}>
              {children}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  className,
  hideClose = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  side?: "right" | "left" | "bottom";
  className?: string;
  hideClose?: boolean;
}) {
  const mounted = useMounted();
  const panelRef = useRef<HTMLDivElement>(null);
  useOverlay(open, onClose, panelRef);

  const close = useCallback(() => onClose(), [onClose]);

  if (!mounted) return null;

  const position =
    side === "right"
      ? "right-0 top-0 h-dvh w-full max-w-[440px] border-l"
      : side === "left"
        ? "left-0 top-0 h-dvh w-full max-w-[380px] border-r"
        : "bottom-0 left-0 w-full max-h-[88dvh] rounded-t-2xl border-t";

  const initial =
    side === "right" ? { x: "100%" } : side === "left" ? { x: "-100%" } : { y: "100%" };
  const exit =
    side === "right" ? { x: "100%" } : side === "left" ? { x: "-100%" } : { y: "100%" };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[95]">
          <motion.div
            className="fixed inset-0 bg-black/65 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title ?? "Panel"}
            tabIndex={-1}
            className={cn(
              "absolute flex flex-col border-line bg-surface shadow-[0_0_120px_-20px_rgba(0,0,0,1)] outline-none",
              position,
              className,
            )}
            initial={initial}
            animate={side === "bottom" ? { y: 0 } : { x: 0 }}
            exit={exit}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
              <h2 className="text-sm font-medium tracking-wide text-content">
                {title}
              </h2>
              {!hideClose ? (
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close panel"
                  className="grid size-8 place-items-center rounded-full text-subtle transition-colors hover:bg-white/5 hover:text-content"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>
            <div className="scrollbar-slim flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
