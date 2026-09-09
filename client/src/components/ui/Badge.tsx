import React from 'react';
import type { ComplianceStatus, ViolationSeverity } from '@sih/shared';

export type BadgeVariant =
  | ComplianceStatus
  | ViolationSeverity
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'NEUTRAL'
  | 'INFO';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'NEUTRAL',
  children,
  icon,
  size = 'md',
}) => {
  const getBadgeStyle = (): React.CSSProperties => {
    switch (variant) {
      case 'COMPLIANT':
        return {
          backgroundColor: 'var(--status-compliant-bg)',
          color: 'var(--status-compliant-text)',
          borderColor: 'var(--status-compliant-border)',
        };
      case 'NON_COMPLIANT':
      case 'CRITICAL':
        return {
          backgroundColor: 'var(--status-noncompliant-bg)',
          color: 'var(--status-noncompliant-text)',
          borderColor: 'var(--status-noncompliant-border)',
        };
      case 'FLAGGED':
      case 'MAJOR':
        return {
          backgroundColor: 'var(--status-flagged-bg)',
          color: 'var(--status-flagged-text)',
          borderColor: 'var(--status-flagged-border)',
        };
      case 'PENDING':
      case 'IN_PROGRESS':
      case 'MINOR':
      case 'INFO':
        return {
          backgroundColor: 'var(--status-info-bg)',
          color: 'var(--status-info-text)',
          borderColor: 'var(--status-info-border)',
        };
      case 'NOT_APPLICABLE':
      case 'NEUTRAL':
      default:
        return {
          backgroundColor: 'var(--bg-subtle)',
          color: 'var(--text-secondary)',
          borderColor: 'var(--border-strong)',
        };
    }
  };

  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: isSmall ? '0.15rem 0.45rem' : '0.2rem 0.6rem',
        fontSize: isSmall ? '0.7rem' : '0.75rem',
        fontWeight: 600,
        borderRadius: 'var(--radius-xs)',
        borderWidth: '1px',
        borderStyle: 'solid',
        letterSpacing: '0.025em',
        textTransform: 'uppercase',
        ...getBadgeStyle(),
      }}
    >
      {icon}
      {children}
    </span>
  );
};
