import React from 'react';
import { Plus } from 'lucide-react';
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
import { MOCK_INSPECTIONS } from '../data/mockData.js';

export const ProductsView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Registered Packaged Commodities
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Database of commodities registered for inspection and retail market surveillance.
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>
          Register New Commodity
        </Button>
      </div>

      <Card padding="none">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>SKU Code</TableHeaderCell>
              <TableHeaderCell>Commodity Name</TableHeaderCell>
              <TableHeaderCell>Brand / Manufacturer</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Standard MRP</TableHeaderCell>
              <TableHeaderCell>Compliance Standing</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {MOCK_INSPECTIONS.map((p) => (
              <TableRow key={p.sku}>
                <TableCell style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.8125rem' }}>
                  {p.sku}
                </TableCell>
                <TableCell style={{ fontWeight: 600 }}>{p.productName}</TableCell>
                <TableCell style={{ color: 'var(--text-secondary)' }}>{p.brand}</TableCell>
                <TableCell>
                  <Badge variant="NEUTRAL" size="sm">{p.category}</Badge>
                </TableCell>
                <TableCell style={{ fontSize: '0.8125rem' }}>{p.mrp}</TableCell>
                <TableCell>
                  <Badge variant={p.status} size="sm">{p.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
