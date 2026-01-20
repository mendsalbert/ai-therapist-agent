import React, { forwardRef } from 'react';
import { Input } from './input';
import { Label } from './label';
import { cn } from '@/lib/utils';
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';

interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
  containerClassName?: string;
  rightContent?: React.ReactNode;
  onKeyboardEnter?: () => void;
  onKeyboardEscape?: () => void;
  onKeyboardTab?: () => void;
  onKeyboardShiftTab?: () => void;
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({
    label,
    error,
    helperText,
    required = false,
    className,
    labelClassName,
    errorClassName,
    helperClassName,
    containerClassName,
    rightContent,
    onKeyboardEnter,
    onKeyboardEscape,
    onKeyboardTab,
    onKeyboardShiftTab,
    id,
    ...props
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(' ');

    const inputRef = useKeyboardNavigation({
      onEnter: onKeyboardEnter,
      onEscape: onKeyboardEscape,
      onTab: onKeyboardTab,
      onShiftTab: onKeyboardShiftTab,
      preventDefault: false, // Allow default behavior for most keys
    });

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <Label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium',
              error && 'text-red-500',
              labelClassName
            )}
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </Label>
        )}
        
        <div className="relative">
          <Input
            ref={(node) => {
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              if (inputRef.current) {
                inputRef.current = node;
              }
            }}
            id={inputId}
            className={cn(
              rightContent && 'pr-12',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy || undefined}
            aria-required={required}
            {...props}
          />
          {rightContent && (
            <div className="absolute inset-y-0 right-3 flex items-center">
              {rightContent}
            </div>
          )}
        </div>
        
        {error && (
          <p
            id={errorId}
            className={cn(
              'text-sm text-red-500',
              errorClassName
            )}
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p
            id={helperId}
            className={cn(
              'text-sm text-gray-500',
              helperClassName
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';
