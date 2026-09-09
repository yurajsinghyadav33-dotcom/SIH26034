import React from 'react';
import { ShieldCheck } from 'lucide-react';
import {
  Card,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from '../components/ui/index.js';
import { MOCK_RULES } from '../data/mockData.js';

export const RulesView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Deterministic Legal Metrology Rules Catalog
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Codified statutory rules from Legal Metrology (Packaged Commodities) Rules, 2011 & Amendments.
          </p>
        </div>
        <Badge variant="COMPLIANT" icon={<ShieldCheck size={12} />}>
          Active Rule Engine v2011.1
        </Badge>
      </div>

      <Card padding="none">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Rule ID</TableHeaderCell>
              <TableHeaderCell>Statutory Clause</TableHeaderCell>
              <TableHeaderCell>Rule Title</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Severity</TableHeaderCell>
              <TableHeaderCell>Statutory Citation</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_RULES.map((rule) => (
              <TableRow key={rule.ruleId}>
                <TableCell style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 600 }}>
                  {rule.ruleId}
                </TableCell>
                <TableCell style={{ fontWeight: 600, color: 'var(--brand-blue)' }}>
                  {rule.clause}
                </TableCell>
                <TableCell>
                  <div style={{ fontWeight: 600 }}>{rule.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '320px' }}>
                    {rule.description}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="NEUTRAL" size="sm">{rule.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={rule.severity} size="sm">{rule.severity}</Badge>
                </TableCell>
                <TableCell style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {rule.statutoryReference}
                </TableCell>
                <TableCell>
                  <Badge variant="COMPLIANT" size="sm">ACTIVE</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
