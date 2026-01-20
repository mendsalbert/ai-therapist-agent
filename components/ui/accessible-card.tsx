import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from '@/lib/utils';
import { useKeyboardNavigation } from '@/hooks/use-keyboard-navigation';

interface AccessibleCardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  role?: string;
  tabIndex?: number;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaExpanded?: boolean;
  ariaControls?: string;
  interactive?: boolean;
}

export function AccessibleCard({
  children,
  title,
  description,
  className,
  onClick,
  onKeyDown,
  role = 'article',
  tabIndex,
  ariaLabel,
  ariaDescribedBy,
  ariaExpanded,
  ariaControls,
  interactive = false,
}: AccessibleCardProps) {
  const cardRef = useKeyboardNavigation({
    onEnter: interactive ? onClick : undefined,
    onSpace: interactive ? onClick : undefined,
    preventDefault: interactive,
  });

  const handleKeyDown = (event: React.KeyboardEvent) => {
    onKeyDown?.(event);
  };

  return (
    <Card
      ref={cardRef}
      className={cn(
        'focus:outline-none',
        interactive && 'cursor-pointer hover:shadow-lg transition-shadow',
        interactive && 'focus:ring-2 focus:ring-primary focus:ring-offset-2',
        className
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={role}
      tabIndex={interactive ? (tabIndex ?? 0) : tabIndex}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
    >
      {title && (
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {title}
          </CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
