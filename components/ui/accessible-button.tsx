import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaExpanded?: boolean;
  ariaPressed?: boolean;
  ariaControls?: string;
  ariaHaspopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  onKeyboardActivate?: () => void;
  onKeyboardEscape?: () => void;
  loading?: boolean;
  loadingText?: string;
}

export function AccessibleButton({
  children,
  variant = 'default',
  size = 'default',
  className,
  ariaLabel,
  ariaDescribedBy,
  ariaExpanded,
  ariaPressed,
  ariaControls,
  ariaHaspopup,
  onKeyboardActivate,
  onKeyboardEscape,
  loading = false,
  loadingText = 'Loading...',
  onClick,
  disabled,
  ...props
}: AccessibleButtonProps) {
  const buttonRef = useKeyboardNavigation({
    onEnter: onKeyboardActivate || onClick,
    onSpace: onKeyboardActivate || onClick,
    onEscape: onKeyboardEscape,
    preventDefault: true,
  });

  const isDisabled = disabled || loading;

  return (
    <Button
      ref={buttonRef}
      variant={variant}
      size={size}
      className={cn(
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        className
      )}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-pressed={ariaPressed}
      aria-controls={ariaControls}
      aria-haspopup={ariaHaspopup}
      {...props}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
