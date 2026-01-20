import { useState, useCallback, useEffect } from "react";

/**
 * Hook to manage popup state and coordinate with keyboard behavior
 * Provides smooth transitions and prevents layout conflicts
 */
export function usePopupManager() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupType, setPopupType] = useState<string | null>(null);

  // Open a popup and hide the footer
  const openPopup = useCallback((type?: string) => {
    setIsPopupOpen(true);
    setPopupType(type || null);
    
    // Dismiss keyboard if open
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, []);

  // Close popup and restore footer
  const closePopup = useCallback(() => {
    setIsPopupOpen(false);
    setPopupType(null);
  }, []);

  // Toggle popup
  const togglePopup = useCallback((type?: string) => {
    if (isPopupOpen) {
      closePopup();
    } else {
      openPopup(type);
    }
  }, [isPopupOpen, openPopup, closePopup]);

  // Close popup on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPopupOpen) {
        closePopup();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isPopupOpen, closePopup]);

  // Prevent body scroll when popup is open
  useEffect(() => {
    if (isPopupOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isPopupOpen]);

  return {
    isPopupOpen,
    popupType,
    openPopup,
    closePopup,
    togglePopup,
  };
}

