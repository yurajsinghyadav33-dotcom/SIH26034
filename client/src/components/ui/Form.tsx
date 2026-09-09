import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, style, ...props }, ref) => (
    <div>
      <input
        ref={ref}
        style={{
          width: '100%',
          padding: '0.45rem 0.75rem',
          fontSize: '0.875rem',
          borderRadius: 'var(--radius-sm)',
          border: `1px solid ${error ? '#dc2626' : 'var(--border-strong)'}`,
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          transition: 'border-color 0.15s ease',
          ...style,
        }}
        {...props}
      />
      {error && (
        <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  )
);
Input.displayName = 'Input';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, children, style, ...props }, ref) => (
    <div>
      <select
        ref={ref}
        style={{
          width: '100%',
          padding: '0.45rem 0.75rem',
          fontSize: '0.875rem',
          borderRadius: 'var(--radius-sm)',
          border: `1px solid ${error ? '#dc2626' : 'var(--border-strong)'}`,
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          ...style,
        }}
        {...props}
      >
        {children}
      </select>
      {error && (
        <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  )
);
Select.displayName = 'Select';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, style, ...props }, ref) => (
    <div>
      <textarea
        ref={ref}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          fontSize: '0.875rem',
          borderRadius: 'var(--radius-sm)',
          border: `1px solid ${error ? '#dc2626' : 'var(--border-strong)'}`,
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          fontFamily: 'inherit',
          minHeight: '80px',
          ...style,
        }}
        {...props}
      />
      {error && (
        <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  )
);
Textarea.displayName = 'Textarea';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({ children, required, style, ...props }) => (
  <label
    style={{
      display: 'block',
      fontSize: '0.8125rem',
      fontWeight: 500,
      color: 'var(--text-secondary)',
      marginBottom: '0.35rem',
      ...style,
    }}
    {...props}
  >
    {children}
    {required && <span style={{ color: '#dc2626', marginLeft: '0.25rem' }}>*</span>}
  </label>
);

export const FormField: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <div style={{ marginBottom: '1rem', ...style }}>{children}</div>
);
