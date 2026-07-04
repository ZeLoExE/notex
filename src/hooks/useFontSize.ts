import { useCallback, useRef } from 'react';

export function useFontSize() {
  const lastRangeRef = useRef<Range | null>(null);

  const captureSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.getRangeAt(0).collapsed) {
      lastRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  const applyFontSize = useCallback((size: number) => {
    let range = lastRangeRef.current;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0);
      if (!r.collapsed) range = r;
    }
    if (!range || range.collapsed) return;

    const workRange = range.cloneRange();
    const frag = workRange.extractContents();
    const span = document.createElement('span');
    span.style.fontSize = `${size}px`;
    span.appendChild(frag);
    workRange.insertNode(span);

    const after = document.createRange();
    after.setStartAfter(span);
    after.collapse(true);
    const s = window.getSelection();
    if (s) { s.removeAllRanges(); s.addRange(after); }

    const editable = span.closest('[contenteditable]') as HTMLElement | null;
    if (editable) {
      queueMicrotask(() => {
        editable.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }
  }, []);

  const getCursorFontSize = useCallback((): number | null => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node: Node | null = sel.anchorNode;
    if (!node) return null;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
    let el = node as HTMLElement | null;
    while (el) {
      if (el.style?.fontSize) {
        const px = parseFloat(el.style.fontSize);
        if (!isNaN(px)) return Math.round(px);
      }
      el = el.parentElement;
    }
    return null;
  }, []);

  return { applyFontSize, getCursorFontSize, captureSelection };
}
