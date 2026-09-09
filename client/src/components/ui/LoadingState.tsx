import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  subtext?: string;
  minHeight?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading compliance records...',
  subtext = 'Validating Legal Metrology data',
  minHeight = '240px',
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight,
      padding: '2rem',
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      textAlign: 'center',
    }}
  >
    <Loader2
      size={36}
      color="var(--brand-blue)"
      style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }}
    />
    <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
      {message}
    </p>
    {subtext && (
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
        {subtext}
      </p>
    )}
  </div>
);

export const Skeleton: React.FC<{
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}> = ({ width = '100%', height = '1rem', borderRadius = 'var(--radius-xs)', style }) => (
  <div
    style={{
      width,
      height,
      borderRadius,
      backgroundColor: 'var(--bg-muted)',
      opacity: 0.7,
      animation: 'pulse 1.5s ease-in-out infinite',
      ...style,
    }}
  />
);
