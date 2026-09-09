import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button.js';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  minHeight?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'System Error Detected',
  message,
  onRetry,
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
      backgroundColor: 'var(--status-noncompliant-bg)',
      border: '1px solid var(--status-noncompliant-border)',
      borderRadius: 'var(--radius-md)',
      textAlign: 'center',
    }}
  >
    <div
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        backgroundColor: '#fee2e2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '0.85rem',
      }}
    >
      <AlertTriangle size={24} color="#dc2626" />
    </div>
    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#991b1b' }}>
      {title}
    </h3>
    <p
      style={{
        fontSize: '0.8125rem',
        color: '#b91c1c',
        maxWidth: '460px',
        marginTop: '0.35rem',
        marginBottom: onRetry ? '1.25rem' : '0',
      }}
    >
      {message}
    </p>
    {onRetry && (
      <Button
        variant="danger"
        size="sm"
        onClick={onRetry}
        leftIcon={<RefreshCw size={14} />}
      >
        Retry Verification
      </Button>
    )}
  </div>
);

export const AlertBanner: React.FC<{
  type?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  message: string;
  onClose?: () => void;
}> = ({ type = 'warning', title, message, onClose }) => {
  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'var(--status-noncompliant-bg)',
          text: 'var(--status-noncompliant-text)',
          border: 'var(--status-noncompliant-border)',
        };
      case 'success':
        return {
          bg: 'var(--status-compliant-bg)',
          text: 'var(--status-compliant-text)',
          border: 'var(--status-compliant-border)',
        };
      case 'info':
        return {
          bg: 'var(--status-info-bg)',
          text: 'var(--status-info-text)',
          border: 'var(--status-info-border)',
        };
      case 'warning':
      default:
        return {
          bg: 'var(--status-flagged-bg)',
          text: 'var(--status-flagged-text)',
          border: 'var(--status-flagged-border)',
        };
    }
  };

  const s = getStyles();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.65rem 1rem',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: s.bg,
        border: `1px solid ${s.border}`,
        color: s.text,
        fontSize: '0.8125rem',
        marginBottom: '1rem',
      }}
    >
      <div>
        {title && <strong>{title}: </strong>}
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{ color: s.text, fontWeight: 700, marginLeft: '1rem' }}
        >
          &times;
        </button>
      )}
    </div>
  );
};
