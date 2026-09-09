import React, { useState } from 'react';
import {
  Barcode,
  CheckCircle2,
  AlertOctagon,
  Globe,
  Building2,
  Tag,
  Search,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './Card.js';
import { Badge } from './Badge.js';
import { Button } from './Button.js';
import {
  analyzePackagingBarcode,
  BarcodeIntelligenceResult,
} from '../../services/barcodeService.js';

export interface BarcodeIntelligenceCardProps {
  initialBarcode?: string | null;
  declaredManufacturer?: string;
  declaredCountry?: string;
  onBarcodeChange?: (barcode: string) => void;
}

export const BarcodeIntelligenceCard: React.FC<BarcodeIntelligenceCardProps> = ({
  initialBarcode = '8901063139466',
  declaredManufacturer,
  declaredCountry = 'India',
  onBarcodeChange,
}) => {
  const [barcodeInput, setBarcodeInput] = useState<string>(initialBarcode || '8901063139466');
  const [analysis, setAnalysis] = useState<BarcodeIntelligenceResult>(() =>
    analyzePackagingBarcode(initialBarcode || '8901063139466', declaredManufacturer, declaredCountry)
  );

  const handleAnalyze = (code: string) => {
    setBarcodeInput(code);
    const result = analyzePackagingBarcode(code, declaredManufacturer, declaredCountry);
    setAnalysis(result);
    if (onBarcodeChange) onBarcodeChange(code);
  };

  return (
    <Card depth="elevated">
      <CardHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Barcode size={20} color="var(--brand-blue)" />
          <div>
            <CardTitle>Barcode & GS1 Intelligence System</CardTitle>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              GS1 Global Registry & Legal Metrology Rules, 2011 Statutory Verification
            </p>
          </div>
        </div>
        <Badge
          variant={
            analysis.ruleConformity.statutoryVerdict === 'COMPLIANT'
              ? 'COMPLIANT'
              : analysis.ruleConformity.statutoryVerdict === 'INVALID'
              ? 'NON_COMPLIANT'
              : 'FLAGGED'
          }
        >
          {analysis.ruleConformity.statutoryVerdict === 'COMPLIANT'
            ? 'VALID GS1 EAN-13'
            : analysis.ruleConformity.statutoryVerdict === 'INVALID'
            ? 'INVALID BARCODE'
            : 'NEEDS REVIEW'}
        </Badge>
      </CardHeader>

      <CardContent>
        {/* Visual Barcode Display Simulation */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            textAlign: 'center',
            marginBottom: '1rem',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          {/* Simulated 1D Barcode Strip with Guard Bars */}
          <div
            style={{
              height: '52px',
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'center',
              gap: '2px',
              marginBottom: '0.4rem',
              userSelect: 'none',
            }}
          >
            {/* Guard bar left */}
            <div style={{ width: '3px', backgroundColor: '#0f172a' }} />
            <div style={{ width: '2px', backgroundColor: 'transparent' }} />
            <div style={{ width: '3px', backgroundColor: '#0f172a' }} />
            
            {/* Pattern bars generated from barcode digits */}
            {(analysis.barcode || '8901063139466').split('').map((char: string, idx: number) => {
              const num = parseInt(char, 10) || 0;
              const barW = (num % 3) + 2;
              const spaceW = ((num + 1) % 3) + 2;
              return (
                <React.Fragment key={idx}>
                  <div style={{ width: `${barW}px`, backgroundColor: '#0f172a' }} />
                  <div style={{ width: `${spaceW}px`, backgroundColor: 'transparent' }} />
                </React.Fragment>
              );
            })}

            {/* Guard bar right */}
            <div style={{ width: '3px', backgroundColor: '#0f172a' }} />
            <div style={{ width: '2px', backgroundColor: 'transparent' }} />
            <div style={{ width: '3px', backgroundColor: '#0f172a' }} />
          </div>

          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.05rem',
              fontWeight: 800,
              letterSpacing: '0.22em',
              color: '#0f172a',
            }}
          >
            {analysis.barcode || '—'}
          </p>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            ISO/IEC 15420 Standard Linear Barcode
          </p>
        </div>

        {/* What is it for? — Educational Public Guidance */}
        <div
          style={{
            backgroundColor: 'var(--bg-subtle)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '4px solid var(--brand-blue)',
            marginBottom: '1rem',
            fontSize: '0.8125rem',
            lineHeight: 1.5,
          }}
        >
          <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            What is this barcode for?
          </p>
          <p style={{ color: 'var(--text-secondary)' }}>
            This 13-digit EAN-13 code is the official statutory product identifier registered with GS1 India under the Ministry of Commerce & Industry. It encodes the <strong>Country of Origin (890 = India)</strong>, the <strong>Licensed Manufacturer Prefix</strong>, and the <strong>Unique SKU Item Code</strong>, verified by a mathematical Modulo-10 checksum to prevent counterfeit retail POS scans.
          </p>
        </div>

        {/* Decoded Technical Architecture Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-blue)', fontSize: '0.75rem', fontWeight: 600 }}>
              <Globe size={14} />
              <span>Country Allocation (Prefix)</span>
            </div>
            <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {analysis.countryPrefix} • {analysis.countryName}
            </p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {analysis.isIndianOrigin ? '🇮🇳 Indian Domestic Commerce' : '🌐 International Import'}
            </p>
          </div>

          <div style={{ padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-blue)', fontSize: '0.75rem', fontWeight: 600 }}>
              <Building2 size={14} />
              <span>GS1 Licensee / Manufacturer</span>
            </div>
            <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {analysis.registeredEntity}
            </p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Company Prefix: {analysis.companyPrefix}
            </p>
          </div>

          <div style={{ padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--brand-blue)', fontSize: '0.75rem', fontWeight: 600 }}>
              <Tag size={14} />
              <span>Product Classification (GPC)</span>
            </div>
            <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {analysis.productClassification}
            </p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {analysis.identifiedProductName}
            </p>
          </div>

          <div style={{ padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: analysis.isValidChecksum ? '#15803d' : '#b91c1c', fontSize: '0.75rem', fontWeight: 600 }}>
              {analysis.isValidChecksum ? <CheckCircle2 size={14} /> : <AlertOctagon size={14} />}
              <span>Modulo-10 Check Digit</span>
            </div>
            <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: analysis.isValidChecksum ? '#15803d' : '#b91c1c', marginTop: '0.25rem' }}>
              {analysis.checkDigit} ({analysis.isValidChecksum ? 'Verified Valid' : `Expected ${analysis.calculatedCheckDigit}`})
            </p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              ISO 15420 Checksum Formula
            </p>
          </div>
        </div>

        {/* Legal Metrology Rules 2011 Conformity Verdict Box */}
        <div
          style={{
            border: `1px solid ${
              analysis.ruleConformity.statutoryVerdict === 'COMPLIANT'
                ? 'var(--status-compliant-border)'
                : 'var(--status-noncompliant-border)'
            }`,
            backgroundColor:
              analysis.ruleConformity.statutoryVerdict === 'COMPLIANT'
                ? 'var(--status-compliant-bg)'
                : 'var(--status-noncompliant-bg)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span
              style={{
                fontWeight: 800,
                fontSize: '0.875rem',
                color:
                  analysis.ruleConformity.statutoryVerdict === 'COMPLIANT'
                    ? 'var(--status-compliant-text)'
                    : 'var(--status-noncompliant-text)',
              }}
            >
              LEGAL METROLOGY (PACKAGED COMMODITIES) RULES, 2011 VERDICT:
            </span>
            <Badge
              variant={
                analysis.ruleConformity.statutoryVerdict === 'COMPLIANT'
                  ? 'COMPLIANT'
                  : 'NON_COMPLIANT'
              }
              size="sm"
            >
              {analysis.ruleConformity.statutoryVerdict}
            </Badge>
          </div>

          <p
            style={{
              fontSize: '0.8125rem',
              color:
                analysis.ruleConformity.statutoryVerdict === 'COMPLIANT'
                  ? 'var(--status-compliant-text)'
                  : 'var(--status-noncompliant-text)',
              marginBottom: '0.5rem',
              fontWeight: 500,
            }}
          >
            {analysis.ruleConformity.explanation}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {analysis.ruleConformity.notes.map((note: string, i: number) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <span style={{ color: '#15803d' }}>•</span>
                <span>{note}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Test Barcode Switcher */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Scan / Enter Any Barcode to Judge:
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              Enter 13-digit EAN code
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="e.g. 8901063139466"
              style={{
                flex: 1,
                padding: '0.45rem 0.75rem',
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-mono)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-strong)',
                backgroundColor: 'var(--bg-surface)',
              }}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleAnalyze(barcodeInput)}
              leftIcon={<Search size={14} />}
            >
              Analyze Barcode
            </Button>
          </div>

          {/* Quick Presets */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
              Quick Presets:
            </span>
            <Button
              variant="outline"
              size="sm"
              style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem' }}
              onClick={() => handleAnalyze('8901063139466')}
            >
              🍪 Britannia Biscuits (8901063139466)
            </Button>
            <Button
              variant="outline"
              size="sm"
              style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem' }}
              onClick={() => handleAnalyze('8901499009823')}
            >
              🍪 Parle-G (8901499009823)
            </Button>
            <Button
              variant="outline"
              size="sm"
              style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem' }}
              onClick={() => handleAnalyze('8906090576604')}
            >
              🍿 Too Yumm! (8906090576604)
            </Button>
            <Button
              variant="outline"
              size="sm"
              style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem' }}
              onClick={() => handleAnalyze('8901030882104')}
            >
              🥣 FMCG Oats (8901030882104)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
