import React from 'react';
import { FileText, Download, Printer } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
} from '../components/ui/index.js';

export const ReportsView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Statutory Compliance Reports & Certificates
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Download formal inspection certificates, compounding summons, and audit certificates.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Form LM-1: Inspection Certificate</CardTitle>
              <CardDescription>Verified Certificate for Compliant Packaging</CardDescription>
            </div>
            <Badge variant="COMPLIANT">Verified</Badge>
          </CardHeader>
          <CardContent>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Certifies that commodity batch BCH-2026-04A conforms with all declarations under Rule 6(1)(a-n), Rule 7 font metrics, and Rule 11 standard SI measurements.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" onClick={() => window.print()} leftIcon={<Printer size={14} />}>Print</Button>
            <Button variant="primary" size="sm" onClick={() => window.print()} leftIcon={<Download size={14} />}>Download PDF</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Section 36 Compounding Notice</CardTitle>
              <CardDescription>Legal Notice for Missing Unit Sale Price</CardDescription>
            </div>
            <Badge variant="CRITICAL">Draft Notice</Badge>
          </CardHeader>
          <CardContent>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Notice served to AuraBotanics India under Rule 6(11) for packaging distributed without mandatory Unit Sale Price. Prescribes compounding fine liability.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="danger" size="sm" leftIcon={<FileText size={14} />}>Generate Notice</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Monthly Zonal Audit Summary</CardTitle>
              <CardDescription>Consolidated Legal Metrology Enforcement Report</CardDescription>
            </div>
            <Badge variant="INFO">August 2026</Badge>
          </CardHeader>
          <CardContent>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Statistical breakdown of 1,248 inspected packaged commodities across 5 commodity classifications with violation breakdown and fine recoveries.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" size="sm" leftIcon={<Download size={14} />}>Export Report</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
