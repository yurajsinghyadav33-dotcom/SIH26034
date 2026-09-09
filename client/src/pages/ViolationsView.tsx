import React from 'react';
import { FileWarning, ShieldAlert } from 'lucide-react';
import {
  Card,
  Button,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '../components/ui/index.js';
import { MOCK_VIOLATIONS } from '../data/mockData.js';

export const ViolationsView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--status-noncompliant-bg)',
          border: '1px solid var(--status-noncompliant-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldAlert size={24} color="#dc2626" />
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#991b1b' }}>
              Statutory Non-Compliance Register (Rule Violations)
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#b91c1c' }}>
              Offenses punishable under Section 36 of Legal Metrology Act, 2009 (Compounding & Fine Liabilities).
            </p>
          </div>
        </div>
        <Badge variant="CRITICAL">3 Active Violations</Badge>
      </div>

      <Card padding="none">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Violation ID</TableHeaderCell>
              <TableHeaderCell>Product & Manufacturer</TableHeaderCell>
              <TableHeaderCell>Rule Clause</TableHeaderCell>
              <TableHeaderCell>Severity</TableHeaderCell>
              <TableHeaderCell>Detected Non-Compliance</TableHeaderCell>
              <TableHeaderCell>Statutory Evidence</TableHeaderCell>
              <TableHeaderCell style={{ textAlign: 'right' }}>Enforcement</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_VIOLATIONS.map((item) => (
              <TableRow key={item.id}>
                <TableCell style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 600, color: '#dc2626' }}>
                  {item.id}
                </TableCell>
                <TableCell>
                  <div style={{ fontWeight: 600 }}>{item.productName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.brand}</div>
                </TableCell>
                <TableCell>
                  <div style={{ fontWeight: 600, color: 'var(--brand-blue)' }}>{item.ruleClause}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.ruleTitle}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={item.severity} size="sm">{item.severity}</Badge>
                </TableCell>
                <TableCell style={{ fontSize: '0.8125rem', maxWidth: '280px' }}>
                  {item.detectedIssue}
                </TableCell>
                <TableCell style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', maxWidth: '220px', color: 'var(--text-secondary)' }}>
                  {item.evidenceSnippet}
                </TableCell>
                <TableCell style={{ textAlign: 'right' }}>
                  <Button variant="danger" size="sm" leftIcon={<FileWarning size={12} />}>
                    Issue Notice
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
