import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }
export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const dialog = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const root = document.getElementById('root');
    const oldInert = root?.inert ?? false;
    if (root) root.inert = true;
    dialog.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key !== 'Tab') return;
      const items = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),[tabindex="0"]') ?? []).filter(el => el.getClientRects().length > 0);
      const first = items[0]; const last = items.at(-1);
      if (!first || !last) { event.preventDefault(); dialog.current?.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = bodyOverflow; if (root) root.inert = oldInert; previous?.focus(); };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return createPortal(<div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="w-full max-w-2xl max-h-[90dvh] overflow-auto rounded-xl bg-sentinel-card border border-sentinel-border p-6">
      <div className="flex justify-between items-center gap-4 mb-6"><h2 id={titleId} className="text-xl font-semibold">{title}</h2><button className="btn-secondary min-h-11" onClick={onClose} aria-label="Close dialog">Close</button></div>
      {children}
    </div>
  </div>, document.body);
}
