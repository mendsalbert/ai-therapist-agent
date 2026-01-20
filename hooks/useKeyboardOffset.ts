import { useEffect, useState } from "react";

/**
 * Enhanced keyboard offset hook that intelligently handles mobile keyboards
 * Returns the keyboard height in pixels for proper positioning
 */
export function useKeyboardOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId: number | null = null;
    let isKeyboardOpen = false;

    const updateOffset = () => {
      const visualViewport = window.visualViewport;
      
      if (visualViewport) {
        // Use visual viewport for accurate keyboard detection
        const windowHeight = window.innerHeight;
        const viewportHeight = visualViewport.height;
        
        // Calculate keyboard height
        const keyboardHeight = Math.max(0, windowHeight - viewportHeight);
        
        // Determine if keyboard is open (threshold of 150px to avoid false positives)
        const wasOpen = isKeyboardOpen;
        isKeyboardOpen = keyboardHeight > 150;
        
        // Lock body scroll when keyboard opens
        if (isKeyboardOpen && !wasOpen) {
          document.body.style.position = 'fixed';
          document.body.style.width = '100%';
          document.body.style.overflow = 'hidden';
          document.documentElement.classList.add("keyboard-open");
        } else if (!isKeyboardOpen && wasOpen) {
          document.body.style.position = '';
          document.body.style.width = '';
          document.body.style.overflow = '';
          document.documentElement.classList.remove("keyboard-open");
        }
        
        setOffset(keyboardHeight);
      }
    };

    const handleResize = () => {
      // Update immediately without debounce for responsiveness
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateOffset);
    };

    // Initialize
    updateOffset();

    // Use visualViewport for better mobile keyboard detection
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
      
      // Clean up body styles
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.documentElement.classList.remove("keyboard-open");
    };
  }, []);

  // Set CSS variable for use in components
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty(
        "--keyboard-offset",
        `${offset}px`
      );
    }
  }, [offset]);

  return offset;
}
