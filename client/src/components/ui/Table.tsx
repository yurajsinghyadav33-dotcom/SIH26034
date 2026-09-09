import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  children,
  style,
  ...props
}) => (
  <div style={{ width: '100%', overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
        fontSize: '0.875rem',
        ...style,
      }}
      {...props}
    >
      {children}
    </table>
  </div>
);

export const TableHead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  style,
  ...props
}) => (
  <thead
    style={{
      backgroundColor: 'var(--bg-subtle)',
      borderBottom: '1px solid var(--border-strong)',
      color: 'var(--text-secondary)',
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontWeight: 600,
      ...style,
    }}
    {...props}
  >
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  style,
  ...props
}) => (
  <tbody style={{ backgroundColor: 'var(--bg-surface)', ...style }} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  style,
  ...props
}) => (
  <tr
    style={{
      borderBottom: '1px solid var(--border-subtle)',
      transition: 'background-color 0.1s ease',
      ...style,
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-subtle)';
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
    }}
    {...props}
  >
    {children}
  </tr>
);

export const TableHeaderCell: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  style,
  ...props
}) => (
  <th
    style={{
      padding: '0.65rem 1rem',
      fontWeight: 600,
      whiteSpace: 'nowrap',
      ...style,
    }}
    {...props}
  >
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  style,
  ...props
}) => (
  <td
    style={{
      padding: '0.75rem 1rem',
      color: 'var(--text-primary)',
      verticalAlign: 'middle',
      ...style,
    }}
    {...props}
  >
    {children}
  </td>
);
