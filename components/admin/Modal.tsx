'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export default function Modal({ title, onClose, children, footer, maxWidth = 'max-w-2xl' }: ModalProps) {
  const panel=useRef<HTMLDivElement>(null);
  const close=useRef(onClose);
  useEffect(()=>{close.current=onClose;},[onClose]);
  useEffect(() => {
    const previous=document.activeElement as HTMLElement|null;
    const overflow=document.body.style.overflow;document.body.style.overflow='hidden';
    const elements=()=>Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')??[]);
    elements()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close.current();
      if(event.key==='Tab'){const items=elements(),first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}
    };
    window.addEventListener('keydown', onKey);
    return () => {window.removeEventListener('keydown', onKey);document.body.style.overflow=overflow;previous?.focus();};
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(38,24,15,0.6)] px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`admin-card max-h-[90vh] w-full ${maxWidth} overflow-y-auto`}
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--nova-border-light)] px-6 py-5">
          <h2 className="font-serif text-xl text-[var(--nova-text-dark)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--nova-text-muted)] transition hover:text-[var(--nova-text-dark)]"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
        {footer && <div className="flex gap-3 border-t border-[var(--nova-border-light)] px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}
