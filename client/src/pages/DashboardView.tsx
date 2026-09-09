import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  FileCheck,
  ScanLine,
  Eye,
  RotateCcw,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  Card,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  AlertBanner,
  EmptyState,
} from '../components/ui/index.js';
import {
  getDashboardStats,
  DashboardMetrics,
} from '../services/inspectionClient.js';
import type { NavItemKey } from '../components/layout/Sidebar.js';

export interface DashboardViewProps {
  onNavigate: (tab: NavItemKey) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAlert, setShowAlert] = useState<boolean>(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const data = await getDashboardStats();
      setMetrics(data);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return <Badge variant="COMPLIANT" size="sm">COMPLIANT</Badge>;
      case 'NON_COMPLIANT':
        return <Badge variant="NON_COMPLIANT" size="sm">NON-COMPLIANT</Badge>;
      case 'FLAGGED_FOR_REVIEW':
      case 'INCOMPLETE_DATA':
      case 'FLAGGED':
      default:
        return <Badge variant="FLAGGED" size="sm">NEEDS REVIEW</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. STATUTORY NOTICE & QUICK ACTION HEADER */}
      {showAlert && (
        <AlertBanner
          type="warning"
          title="Statutory Enforcement Notice"
          message="Legal Metrology (Packaged Commodities) Rules, 2011 enforcement active. Rule 6(11) Unit Sale Price mandatory for all commodities packed post 01 Dec 2022."
          onClose={() => setShowAlert(false)}
        />
      )}

      {/* Header with Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Enforcement Operations Cockpit
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Real-time compliance analytics derived from authoritative Legal Metrology inspection records
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={loadDashboardData}
            isLoading={isLoading}
            leftIcon={<RotateCcw size={13} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('Scan Product')}
            leftIcon={<ScanLine size={14} />}
          >
            Scan New Product
          </Button>
        </div>
      </div>

      {/* 2. OPERATIONAL KPI METRICS GRID */}
      <div
        className="perspective-container"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* KPI 1: Total Inspected */}
        <Card padding="md" depth="interactive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Inspected
              </p>
              <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                {metrics ? metrics.totalInspections : '—'}
              </h3>
            </div>
            <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)' }}>
              <FileCheck size={22} color="var(--brand-blue)" />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
            Evaluated against Rules 2011 & Amendments
          </p>
        </Card>

        {/* KPI 2: Compliant Commodities */}
        <Card padding="md" depth="interactive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Compliant Packages
              </p>
              <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--status-compliant-text)', marginTop: '0.25rem' }}>
                {metrics ? metrics.compliantCount : '—'}
              </h3>
            </div>
            <div style={{ padding: '0.6rem', backgroundColor: 'var(--status-compliant-bg)', borderRadius: 'var(--radius-sm)', boxShadow: '0 2px 6px rgba(21, 128, 61, 0.15)' }}>
              <ShieldCheck size={22} color="var(--status-compliant-text)" />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--status-compliant-text)', fontWeight: 600, marginTop: '0.6rem' }}>
            {metrics ? `${metrics.complianceRate}% Compliance Rate` : '—'}
          </p>
        </Card>

        {/* KPI 3: Non-Compliant / Violations */}
        <Card padding="md" depth="interactive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Confirmed Violations
              </p>
              <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--status-noncompliant-text)', marginTop: '0.25rem' }}>
                {metrics ? metrics.nonCompliantCount : '—'}
              </h3>
            </div>
            <div style={{ padding: '0.6rem', backgroundColor: 'var(--status-noncompliant-bg)', borderRadius: 'var(--radius-sm)', boxShadow: '0 2px 6px rgba(185, 28, 28, 0.15)' }}>
              <AlertOctagon size={22} color="var(--status-noncompliant-text)" />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--status-noncompliant-text)', fontWeight: 600, marginTop: '0.6rem' }}>
            Subject to Section 36 notices
          </p>
        </Card>

        {/* KPI 4: Needs Review / Ambiguous Panels */}
        <Card padding="md" depth="interactive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Needs Review
              </p>
              <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--status-flagged-text)', marginTop: '0.25rem' }}>
                {metrics ? metrics.needsReviewCount : '—'}
              </h3>
            </div>
            <div style={{ padding: '0.6rem', backgroundColor: 'var(--status-flagged-bg)', borderRadius: 'var(--radius-sm)', boxShadow: '0 2px 6px rgba(180, 83, 9, 0.15)' }}>
              <AlertTriangle size={22} color="var(--status-flagged-text)" />
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--status-flagged-text)', fontWeight: 600, marginTop: '0.6rem' }}>
            Incomplete or ambiguous scans
          </p>
        </Card>
      </div>

      {/* 3. MIDDLE SECTION: COMMON VIOLATIONS & CATEGORY BREAKDOWN */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '1.25rem' }}>
        {/* Left Column: Common Statutory Violations */}
        <Card padding="none">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <CardTitle>Common Statutory Violation Categories</CardTitle>
              <CardDescription>
                Frequency distribution of confirmed statutory non-compliances under Rules 2011
              </CardDescription>
            </div>
            <Badge variant="NON_COMPLIANT" size="sm">Section 36 Act 2009</Badge>
          </div>

          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(!metrics || metrics.commonViolations.length === 0) ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <ShieldCheck size={32} color="#15803d" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontWeight: 600, color: '#15803d' }}>No Statutory Violations Recorded</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  All packages evaluated in this cycle fully comply with mandatory declarations.
                </p>
              </div>
            ) : (
              metrics.commonViolations.map((v, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: 700, color: '#991b1b' }}>{v.clause}</span>
                      <Badge variant="NON_COMPLIANT" size="sm">{v.severity}</Badge>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {v.count} ({v.percentage}%)
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                    {v.title}
                  </p>
                  {/* Frequency Progress Bar */}
                  <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${v.percentage}%`,
                        backgroundColor: '#dc2626',
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right Column: Commodity Category Breakdown */}
        <Card padding="none">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <CardTitle>Commodity Category Distribution</CardTitle>
            <CardDescription>
              Enforcement coverage across packaged commodity sectors
            </CardDescription>
          </div>

          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {(!metrics || metrics.categoryBreakdown.length === 0) ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No category records available.
              </div>
            ) : (
              metrics.categoryBreakdown.map((cat, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{cat.category}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {cat.total} commodities ({cat.complianceRate}% compliant)
                    </span>
                  </div>
                  {/* Multi-segment Compliance Bar */}
                  <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                    {cat.compliant > 0 && (
                      <div style={{ width: `${(cat.compliant / cat.total) * 100}%`, backgroundColor: '#16a34a' }} title={`Compliant: ${cat.compliant}`} />
                    )}
                    {cat.nonCompliant > 0 && (
                      <div style={{ width: `${(cat.nonCompliant / cat.total) * 100}%`, backgroundColor: '#dc2626' }} title={`Non-compliant: ${cat.nonCompliant}`} />
                    )}
                    {cat.needsReview > 0 && (
                      <div style={{ width: `${(cat.needsReview / cat.total) * 100}%`, backgroundColor: '#d97706' }} title={`Needs review: ${cat.needsReview}`} />
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    <span>✅ Pass: {cat.compliant}</span>
                    <span>❌ Fail: {cat.nonCompliant}</span>
                    <span>⚠️ Review: {cat.needsReview}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* 4. RECENT INSPECTIONS FEED */}
      <Card padding="none">
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <CardTitle>Recent Legal Metrology Inspections</CardTitle>
            <CardDescription>
              Latest packaged commodity inspections recorded by enforcement officers
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('Inspections')}
            rightIcon={<ArrowRight size={13} />}
          >
            View Full Inspection Register
          </Button>
        </div>

        {(!metrics || metrics.recentInspections.length === 0) ? (
          <EmptyState
            title="No Inspections Recorded"
            description="No packaged commodity inspection records exist in the database yet. Run your first product scan to generate data."
            action={
              <Button variant="primary" size="sm" onClick={() => onNavigate('Scan Product')}>
                Start Inspection
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell style={{ width: '18%' }}>Inspection ID</TableHeaderCell>
                <TableHeaderCell style={{ width: '28%' }}>Commodity & Brand</TableHeaderCell>
                <TableHeaderCell style={{ width: '12%' }}>Sector</TableHeaderCell>
                <TableHeaderCell style={{ width: '14%' }}>Declared MRP</TableHeaderCell>
                <TableHeaderCell style={{ width: '14%' }}>Statutory Verdict</TableHeaderCell>
                <TableHeaderCell style={{ width: '14%', textAlign: 'right' }}>Action</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {metrics.recentInspections.map((item) => (
                <TableRow key={item.inspectionId}>
                  <TableCell>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-blue)' }}>
                      {item.inspectionId}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {new Date(item.inspectedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                      {item.productName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Brand: <strong>{item.brand}</strong>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="NEUTRAL" size="sm">{item.category}</Badge>
                  </TableCell>

                  <TableCell style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                    {item.mrp}
                  </TableCell>

                  <TableCell>
                    {renderStatusBadge(item.overallStatus)}
                  </TableCell>

                  <TableCell style={{ textAlign: 'right' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigate('Inspections')}
                      leftIcon={<Eye size={12} />}
                    >
                      Dossier
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* 5. INSPECTION TRENDS SECTION WITH SAFE EMPTY STATE */}
      <Card padding="none">
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <CardTitle>Longitudinal Inspection Trends</CardTitle>
            <CardDescription>
              Chronological enforcement trends and multi-day compliance tracking
            </CardDescription>
          </div>
          <Badge variant="NEUTRAL" size="sm">Audit Interval</Badge>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {(!metrics || !metrics.hasSufficientTrendData) ? (
            <div
              style={{
                padding: '2.25rem 1.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-strong)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <div style={{ padding: '0.6rem', backgroundColor: 'var(--bg-surface)', borderRadius: '50%', border: '1px solid var(--border-subtle)' }}>
                <TrendingUp size={24} color="var(--text-muted)" />
              </div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Insufficient Longitudinal Trend Data
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '520px', lineHeight: 1.45 }}>
                Current inspection evaluations were recorded within the recent active operational window. Longitudinal trend analytics and temporal charts will activate automatically as inspections accumulate across multiple operational dates.
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--brand-blue)', fontWeight: 600, marginTop: '0.25rem' }}>
                Active Evaluation Records: {metrics?.totalInspections || 0} commodities tracked
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Multi-day compliance trends:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                {metrics.timelineTrend.map((t) => (
                  <div key={t.date} style={{ border: '1px solid var(--border-subtle)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{t.date}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Total: {t.total} | ✅ {t.compliant} | ❌ {t.nonCompliant}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
