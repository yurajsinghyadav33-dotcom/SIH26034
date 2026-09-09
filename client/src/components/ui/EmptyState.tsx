import React from 'react';
import { PackageSearch } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  minHeight?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <PackageSearch size={44} color="var(--text-muted)" />,
  title,
  description,
  action,
  minHeight = '240px',
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight,
      padding: '2.5rem 1.5rem',
      backgroundColor: 'var(--bg-surface)',
      border: '1px dashed var(--border-strong)',
      borderRadius: 'var(--radius-md)',
      textAlign: 'center',
    }}
  >
    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
      {icon}
    </div>
    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
      {title}
    </h3>
    <p
      style={{
        fontSize: '0.8125rem',
        color: 'var(--text-secondary)',
        maxWidth: '420px',
        marginTop: '0.35rem',
        marginBottom: action ? '1.25rem' : '0',
      }}
    >
      {description}
    </p>
    {action && <div>{action}</div>}
  </div>
);
