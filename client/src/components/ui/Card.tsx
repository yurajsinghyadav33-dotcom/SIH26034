import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  depth?: 'flat' | 'elevated' | 'floating' | 'interactive';
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  depth = 'flat',
  className = '',
  style,
  ...props
}) => {
  const getPadding = () => {
    switch (padding) {
      case 'none':
        return '0';
      case 'sm':
        return '0.75rem';
      case 'lg':
        return '1.75rem';
      case 'md':
      default:
        return '1.25rem';
    }
  };

  const getShadowAndElevation = () => {
    switch (depth) {
      case 'elevated':
        return {
          boxShadow: 'var(--depth-shadow-1)',
          border: '1px solid var(--border-subtle)',
        };
      case 'floating':
        return {
          boxShadow: 'var(--depth-shadow-2)',
          border: '1px solid rgba(37, 99, 235, 0.18)',
        };
      case 'interactive':
        return {
          boxShadow: 'var(--depth-shadow-1)',
          border: '1px solid var(--border-subtle)',
        };
      case 'flat':
      default:
        return {
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--border-subtle)',
        };
    }
  };

  const depthStyles = getShadowAndElevation();
  const cardClassName = `${depth === 'interactive' ? 'depth-card-interactive' : ''} ${className}`.trim();

  return (
    <div
      className={cardClassName}
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        padding: getPadding(),
        ...depthStyles,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  style,
  ...props
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: '0.85rem',
      marginBottom: '0.85rem',
      borderBottom: '1px solid var(--border-subtle)',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  style,
  ...props
}) => (
  <h3
    style={{
      fontSize: '1rem',
      fontWeight: 600,
      color: 'var(--text-primary)',
      letterSpacing: '-0.01em',
      ...style,
    }}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  style,
  ...props
}) => (
  <p
    style={{
      fontSize: '0.8125rem',
      color: 'var(--text-secondary)',
      marginTop: '0.15rem',
      ...style,
    }}
    {...props}
  >
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  style,
  ...props
}) => (
  <div style={{ ...style }} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  style,
  ...props
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '0.5rem',
      paddingTop: '0.85rem',
      marginTop: '0.85rem',
      borderTop: '1px solid var(--border-subtle)',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);
