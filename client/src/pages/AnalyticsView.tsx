import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from '../components/ui/index.js';

export const AnalyticsView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Enforcement & Compliance Analytics
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Real-time statistical breakdown of Legal Metrology compliance rates and violation patterns.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        <Card>
          <CardHeader>
            <CardTitle>Top Violated Rules Breakdown</CardTitle>
            <Badge variant="INFO">Past 90 Days</Badge>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                  <span>Rule 6(11): Unit Sale Price Missing</span>
                  <strong>48% of violations</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '48%', height: '100%', backgroundColor: '#dc2626' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                  <span>Rule 7: Font Height below PDP requirement</span>
                  <strong>28% of violations</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '28%', height: '100%', backgroundColor: '#f59e0b' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                  <span>Rule 6(1)(n): Consumer helpline missing</span>
                  <strong>14% of violations</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '14%', height: '100%', backgroundColor: 'var(--brand-blue)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                  <span>Rule 6(1)(d): Month & Year of packing obscure</span>
                  <strong>10% of violations</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '10%', height: '100%', backgroundColor: '#6b7280' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commodity Category Compliance</CardTitle>
            <Badge variant="COMPLIANT">Avg 86.8%</Badge>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                  <span>Food & FMCG</span>
                  <strong>92.4% Compliant</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '92.4%', height: '100%', backgroundColor: 'var(--status-compliant-text)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                  <span>Cosmetics & Personal Care</span>
                  <strong style={{ color: '#d97706' }}>74.1% Compliant</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '74.1%', height: '100%', backgroundColor: '#f59e0b' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                  <span>Consumer Electronics</span>
                  <strong>89.6% Compliant</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-muted)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '89.6%', height: '100%', backgroundColor: 'var(--status-compliant-text)' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
