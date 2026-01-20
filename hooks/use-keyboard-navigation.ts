import { useEffect, useCallback, useRef } from 'react';

interface KeyboardNavigationOptions {
  onEnter?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
  onSpace?: () => void;
  onDelete?: () => void;
  onBackspace?: () => void;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions) {
  const elementRef = useRef<HTMLElement>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const {
      onEnter,
      onEscape,
      onArrowUp,
      onArrowDown,
      onArrowLeft,
      onArrowRight,
      onTab,
      onShiftTab,
      onSpace,
      onDelete,
      onBackspace,
      preventDefault = true,
      stopPropagation = false
    } = options;

    if (stopPropagation) {
      event.stopPropagation();
    }

    switch (event.key) {
      case 'Enter':
        if (onEnter) {
          if (preventDefault) event.preventDefault();
          onEnter();
        }
        break;
      case 'Escape':
        if (onEscape) {
          if (preventDefault) event.preventDefault();
          onEscape();
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          if (preventDefault) event.preventDefault();
          onArrowUp();
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          if (preventDefault) event.preventDefault();
          onArrowDown();
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          if (preventDefault) event.preventDefault();
          onArrowLeft();
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          if (preventDefault) event.preventDefault();
          onArrowRight();
        }
        break;
      case 'Tab':
        if (event.shiftKey && onShiftTab) {
          if (preventDefault) event.preventDefault();
          onShiftTab();
        } else if (onTab) {
          if (preventDefault) event.preventDefault();
          onTab();
        }
        break;
      case ' ':
        if (onSpace) {
          if (preventDefault) event.preventDefault();
          onSpace();
        }
        break;
      case 'Delete':
        if (onDelete) {
          if (preventDefault) event.preventDefault();
          onDelete();
        }
        break;
      case 'Backspace':
        if (onBackspace) {
          if (preventDefault) event.preventDefault();
          onBackspace();
        }
        break;
    }
  }, [options]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return elementRef;
}

// Hook for managing focus within a container
export function useFocusManagement() {
  const containerRef = useRef<HTMLElement>(null);
  const focusableElements = useRef<HTMLElement[]>([]);

  const updateFocusableElements = useCallback(() => {
    if (!containerRef.current) return;
    
    const focusable = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    focusableElements.current = Array.from(focusable);
  }, []);

  const focusNext = useCallback(() => {
    updateFocusableElements();
    const currentIndex = focusableElements.current.findIndex(
      el => el === document.activeElement
    );
    const nextIndex = (currentIndex + 1) % focusableElements.current.length;
    focusableElements.current[nextIndex]?.focus();
  }, [updateFocusableElements]);

  const focusPrevious = useCallback(() => {
    updateFocusableElements();
    const currentIndex = focusableElements.current.findIndex(
      el => el === document.activeElement
    );
    const prevIndex = currentIndex === 0 
      ? focusableElements.current.length - 1 
      : currentIndex - 1;
    focusableElements.current[prevIndex]?.focus();
  }, [updateFocusableElements]);

  const focusFirst = useCallback(() => {
    updateFocusableElements();
    focusableElements.current[0]?.focus();
  }, [updateFocusableElements]);

  const focusLast = useCallback(() => {
    updateFocusableElements();
    const lastIndex = focusableElements.current.length - 1;
    focusableElements.current[lastIndex]?.focus();
  }, [updateFocusableElements]);

  return {
    containerRef,
    focusNext,
    focusPrevious,
    focusFirst,
    focusLast,
    updateFocusableElements
  };
}

// Hook for skip links
export function useSkipLink() {
  const skipLinkRef = useRef<HTMLAnchorElement>(null);

  const focusSkipLink = useCallback(() => {
    skipLinkRef.current?.focus();
  }, []);

  return { skipLinkRef, focusSkipLink };
}
