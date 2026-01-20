// Accessibility utilities for better user experience

export const ARIA_LABELS = {
  // Navigation
  mainNavigation: 'Main navigation',
  breadcrumb: 'Breadcrumb navigation',
  skipToContent: 'Skip to main content',
  
  // Forms
  form: 'Form',
  requiredField: 'Required field',
  optionalField: 'Optional field',
  submitButton: 'Submit form',
  resetButton: 'Reset form',
  
  // Buttons
  playButton: 'Play audio',
  pauseButton: 'Pause audio',
  stopButton: 'Stop audio',
  favoriteButton: 'Add to favorites',
  unfavoriteButton: 'Remove from favorites',
  closeButton: 'Close',
  openButton: 'Open',
  toggleButton: 'Toggle',
  
  // Audio
  audioPlayer: 'Audio player',
  volumeControl: 'Volume control',
  progressBar: 'Audio progress',
  currentTime: 'Current time',
  duration: 'Total duration',
  
  // Chat
  chatInput: 'Type your message',
  sendMessage: 'Send message',
  chatHistory: 'Chat history',
  newMessage: 'New message',
  
  // Meditations
  meditationCard: 'Meditation card',
  meditationTitle: 'Meditation title',
  meditationDescription: 'Meditation description',
  meditationDuration: 'Meditation duration',
  meditationCategory: 'Meditation category',
  
  // Loading
  loading: 'Loading',
  loadingContent: 'Loading content',
  loadingError: 'Loading error',
  
  // Errors
  errorMessage: 'Error message',
  successMessage: 'Success message',
  warningMessage: 'Warning message',
  
  // Modals
  modal: 'Modal dialog',
  modalClose: 'Close modal',
  modalContent: 'Modal content',
  
  // Tabs
  tabList: 'Tab list',
  tab: 'Tab',
  tabPanel: 'Tab panel',
  
  // Lists
  list: 'List',
  listItem: 'List item',
  
  // Cards
  card: 'Card',
  cardHeader: 'Card header',
  cardContent: 'Card content',
  cardFooter: 'Card footer',
} as const;

export const ARIA_ROLES = {
  button: 'button',
  link: 'link',
  textbox: 'textbox',
  checkbox: 'checkbox',
  radio: 'radio',
  slider: 'slider',
  progressbar: 'progressbar',
  status: 'status',
  alert: 'alert',
  dialog: 'dialog',
  tablist: 'tablist',
  tab: 'tab',
  tabpanel: 'tabpanel',
  list: 'list',
  listitem: 'listitem',
  navigation: 'navigation',
  main: 'main',
  banner: 'banner',
  contentinfo: 'contentinfo',
  complementary: 'complementary',
  region: 'region',
  search: 'search',
  form: 'form',
  group: 'group',
  article: 'article',
  section: 'section',
  heading: 'heading',
  img: 'img',
  button: 'button',
  link: 'link',
  textbox: 'textbox',
  checkbox: 'checkbox',
  radio: 'radio',
  slider: 'slider',
  progressbar: 'progressbar',
  status: 'status',
  alert: 'alert',
  dialog: 'dialog',
  tablist: 'tablist',
  tab: 'tab',
  tabpanel: 'tabpanel',
  list: 'list',
  listitem: 'listitem',
  navigation: 'navigation',
  main: 'main',
  banner: 'banner',
  contentinfo: 'contentinfo',
  complementary: 'complementary',
  region: 'region',
  search: 'search',
  form: 'form',
  group: 'group',
  article: 'article',
  section: 'section',
  heading: 'heading',
  img: 'img',
} as const;

// Generate unique IDs for accessibility
export function generateAriaId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

// Screen reader only text
export function srOnly(className?: string): string {
  return `sr-only ${className || ''}`.trim();
}

// Focus management utilities
export function trapFocus(element: HTMLElement): () => void {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);
  
  // Return cleanup function
  return () => element.removeEventListener('keydown', handleKeyDown);
}

// Announce to screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Check if element is visible to screen readers
export function isVisibleToScreenReader(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    element.getAttribute('aria-hidden') !== 'true' &&
    element.getAttribute('hidden') === null
  );
}

// Get accessible name for element
export function getAccessibleName(element: HTMLElement): string {
  // Check aria-label first
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  // Check aria-labelledby
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelElement = document.getElementById(ariaLabelledBy);
    if (labelElement) return labelElement.textContent || '';
  }

  // Check for associated label
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) return label.textContent || '';
  }

  // Check for text content
  const textContent = element.textContent?.trim();
  if (textContent) return textContent;

  // Check for title attribute
  const title = element.getAttribute('title');
  if (title) return title;

  return '';
}

// Keyboard navigation helpers
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SPACE: ' ',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  DELETE: 'Delete',
  BACKSPACE: 'Backspace',
} as const;

// Focus indicators
export function addFocusIndicator(element: HTMLElement): void {
  element.style.outline = '2px solid #3b82f6';
  element.style.outlineOffset = '2px';
}

export function removeFocusIndicator(element: HTMLElement): void {
  element.style.outline = '';
  element.style.outlineOffset = '';
}
