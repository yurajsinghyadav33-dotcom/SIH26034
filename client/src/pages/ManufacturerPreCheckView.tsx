import React, { useState, useEffect, useRef } from 'react';
import {
  Printer,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  FileText,
  Info,
  CheckSquare,
  Layers,
  Camera,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Barcode,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  Label,
  FormField,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Textarea,
  CameraCaptureModal,
  Carton3DPreview,
  BarcodeIntelligenceCard,
} from '../components/ui/index.js';
import { COMPLIANCE_TEST_SAMPLES, ComplianceTestSample } from '../data/complianceSamples.js';
import {
  analyzeCommodityCompliance,
  ComplianceAnalysisResult,
  performImageOcr,
} from '../services/complianceClient.js';
import { extractBarcodeFromOcrText } from '../services/barcodeService.js';

export const ManufacturerPreCheckView: React.FC = () => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('SAMPLE_COMPLIANT');
  const [rawText, setRawText] = useState<string>(COMPLIANCE_TEST_SAMPLES[0].payload.rawText);
  const [pdpHeight, setPdpHeight] = useState<number>(18.5);
  const [pdpWidth, setPdpWidth] = useState<number>(12.0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'CHECKLIST' | 'ALL_RULES' | 'EXTRACTED' | 'BARCODE'>('CHECKLIST');
  const [analysisResult, setAnalysisResult] = useState<ComplianceAnalysisResult | null>(null);

  // Camera and photo capture state
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement | null>(null);

  const processPackagingImage = async (dataUrl: string, filename: string) => {
    setUploadedPhotoUrl(dataUrl);
    setUploadedFileName(filename);
    setIsOcrProcessing(true);

    try {
      const ocrResult = await performImageOcr(dataUrl, filename);
      if (ocrResult && ocrResult.rawText) {
        setRawText(ocrResult.rawText);
        await executePreCheck(ocrResult.rawText);
      } else {
        await executePreCheck(rawText);
      }
    } catch (err) {
      console.error('Error in pre-check packaging image:', err);
      await executePreCheck(rawText);
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const handlePhotoCapture = (imageDataUrl: string, file: File) => {
    processPackagingImage(imageDataUrl, file.name);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      processPackagingImage(reader.result as string, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      processPackagingImage(reader.result as string, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setUploadedPhotoUrl(null);
    setUploadedFileName(null);
  };

  // Execute pre-check analysis on load
  useEffect(() => {
    executePreCheck(COMPLIANCE_TEST_SAMPLES[0].payload.rawText);
  }, []);

  const handleSelectScenario = (sample: ComplianceTestSample) => {
    setSelectedScenarioId(sample.id);
    setRawText(sample.payload.rawText);
    if (sample.payload.pdpDimensions) {
      setPdpHeight(sample.payload.pdpDimensions.heightMm / 10);
      setPdpWidth(sample.payload.pdpDimensions.widthMm / 10);
    }
    executePreCheck(sample.payload.rawText);
  };

  const executePreCheck = async (textToAnalyze: string) => {
    setIsAnalyzing(true);
    try {
      const res = await analyzeCommodityCompliance({
        rawText: textToAnalyze,
        pdpDimensions: {
          heightMm: pdpHeight * 10,
          widthMm: pdpWidth * 10,
          areaSqCm: Math.round(pdpHeight * pdpWidth * 10) / 10,
        },
      });
      setAnalysisResult(res);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const report = analysisResult?.report;
  const extraction = analysisResult?.extraction;

  // Determine Pre-Print Scorecard Status
  const getPrePrintScorecard = () => {
    if (!report) return null;
    const hasFailures = report.failedCount > 0;
    const hasUncertain = report.uncertainCount > 0 || report.notDetectedCount > 0;

    if (hasFailures) {
      return {
        label: 'STATUTORY CORRECTIONS REQUIRED',
        sublabel: 'Artwork contains affirmative non-compliances that must be corrected before printing.',
        icon: <AlertOctagon size={28} />,
        bg: 'var(--status-noncompliant-bg)',
        text: 'var(--status-noncompliant-text)',
        border: 'var(--status-noncompliant-border)',
        badgeVariant: 'NON_COMPLIANT' as const,
      };
    }

    if (hasUncertain) {
      return {
        label: 'REVISIONS / VERIFICATION RECOMMENDED',
        sublabel: 'One or more mandatory declarations are missing or uncertain on this panel artwork.',
        icon: <AlertTriangle size={28} />,
        bg: 'var(--status-flagged-bg)',
        text: 'var(--status-flagged-text)',
        border: 'var(--status-flagged-border)',
        badgeVariant: 'FLAGGED' as const,
      };
    }

    return {
      label: 'PRE-PRINT VERIFICATION: READY FOR REVIEW',
      sublabel: 'All mandatory Legal Metrology declarations detected without apparent statutory defects.',
      icon: <CheckCircle2 size={28} />,
      bg: 'var(--status-compliant-bg)',
      text: 'var(--status-compliant-text)',
      border: 'var(--status-compliant-border)',
      badgeVariant: 'COMPLIANT' as const,
    };
  };

  const scorecard = getPrePrintScorecard();

  // Filter issues to review (Failures, Uncertainties, and Missing Declarations)
  const issuesToReview = report
    ? report.ruleResults.filter((r) => r.status === 'FAIL' || r.status === 'UNCERTAIN' || r.status === 'NOT_DETECTED')
    : [];

  const handlePrintChecklist = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. PROMINENT DIGITAL PRE-CHECK / ASSISTIVE DISCLAIMER BANNER */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          border: '1.5px solid #93c5fd',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ padding: '0.4rem', backgroundColor: '#dbeafe', borderRadius: 'var(--radius-sm)', color: 'var(--brand-blue)' }}>
          <Info size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#1e3a8a', letterSpacing: '-0.01em' }}>
              DIGITAL PRE-CHECK / ASSISTIVE TOOL — NON-BINDING PRE-PRINT EVALUATION
            </h3>
            <Badge variant="INFO" size="sm">Advisory Only</Badge>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#1e40af', marginTop: '0.35rem', lineHeight: 1.5 }}>
            This automated self-check is an assistive tool to help manufacturers, packers, and packaging artwork designers identify potentially missing, approximate, or uncertain declarations before mass printing and packaging release under the <strong>Legal Metrology (Packaged Commodities) Rules, 2011</strong>.
          </p>
          <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '0.4rem', fontWeight: 600 }}>
            ⚠️ NOTICE: Results generated by this tool are purely advisory and do NOT constitute official statutory approval, exemption, or legally binding certification by the Department of Consumer Affairs or Legal Metrology Officers.
          </div>
        </div>
      </div>

      {/* 2. PRE-CHECK PIPELINE FLOW STEPPER */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          overflowX: 'auto',
          gap: '0.5rem',
        }}
      >
        <span style={{ color: 'var(--brand-blue)' }}>1. Draft Upload</span>
        <span>&rarr;</span>
        <span style={{ color: 'var(--brand-blue)' }}>2. OCR Ingestion</span>
        <span>&rarr;</span>
        <span style={{ color: 'var(--brand-blue)' }}>3. Information Extraction</span>
        <span>&rarr;</span>
        <span style={{ color: 'var(--brand-blue)' }}>4. Applicable Rules Filter</span>
        <span>&rarr;</span>
        <span style={{ color: 'var(--brand-blue)' }}>5. Preliminary Compliance Analysis</span>
        <span>&rarr;</span>
        <span
          style={{
            backgroundColor: scorecard ? scorecard.bg : 'var(--bg-subtle)',
            color: scorecard ? scorecard.text : 'inherit',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-xs)',
            border: `1px solid ${scorecard ? scorecard.border : 'var(--border-subtle)'}`,
          }}
        >
          6. Issues to Review ({issuesToReview.length})
        </span>
      </div>

      {/* 3. DRAFT ARTWORK SCENARIO PICKER */}
      <Card padding="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Select Proposed Packaging Artwork Scenario:
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Evaluate common pre-press packaging scenarios with 1-click
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.5rem' }}>
            {COMPLIANCE_TEST_SAMPLES.map((sample) => {
              const isSelected = selectedScenarioId === sample.id;
              return (
                <button
                  key={sample.id}
                  onClick={() => handleSelectScenario(sample)}
                  style={{
                    padding: '0.6rem 0.85rem',
                    textAlign: 'left',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${isSelected ? 'var(--brand-blue)' : 'var(--border-strong)'}`,
                    backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.8125rem', color: isSelected ? 'var(--brand-blue)' : 'var(--text-primary)' }}>
                      {sample.name}
                    </strong>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.3 }}>
                    {sample.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* 4. DRAFT INPUT & ARTWORK PARAMETERS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
        <Card>
          <CardHeader>
            <CardTitle>Proposed Packaging Artwork Text & Declarations</CardTitle>
            <Badge variant="NEUTRAL">Pre-Press Draft</Badge>
          </CardHeader>
          <CardContent>
            <FormField>
              <Label>Draft Artwork Typography Transcript (Editable)</Label>
              <Textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                style={{ minHeight: '140px', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}
                placeholder="Paste proposed package artwork text here..."
              />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.5rem', marginBottom: '0.85rem' }}>
              <FormField>
                <Label>Principal Display Panel Height (cm)</Label>
                <Input type="number" step="0.5" value={pdpHeight} onChange={(e) => setPdpHeight(Number(e.target.value))} />
              </FormField>
              <FormField>
                <Label>Principal Display Panel Width (cm)</Label>
                <Input type="number" step="0.5" value={pdpWidth} onChange={(e) => setPdpWidth(Number(e.target.value))} />
              </FormField>
              <FormField>
                <Label>Calculated PDP Surface</Label>
                <Input readOnly value={`${Math.round(pdpHeight * pdpWidth * 10) / 10} cm²`} style={{ backgroundColor: 'var(--bg-subtle)', fontWeight: 600 }} />
              </FormField>
            </div>

            {/* 3D Packaging Wireframe & Dimension Preview */}
            <Carton3DPreview
              heightCm={pdpHeight}
              widthCm={pdpWidth}
              pdpAreaCm2={Math.round(pdpHeight * pdpWidth * 10) / 10}
            />
          </CardContent>
          <CardFooter>
            <Button
              variant="primary"
              size="md"
              isLoading={isAnalyzing}
              onClick={() => executePreCheck(rawText)}
              leftIcon={<Printer size={16} />}
            >
              Run Pre-Print Self-Check
            </Button>
          </CardFooter>
        </Card>

        {/* Upload Proposed Artwork / Label Dropzone */}
        <Card depth="elevated">
          <CardHeader>
            <CardTitle>Artwork & Packaging Photo</CardTitle>
            <Badge variant="INFO">Proof Check</Badge>
          </CardHeader>
          <CardContent>
            {/* Hidden file inputs */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <input
              type="file"
              ref={mobileCameraInputRef}
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {uploadedPhotoUrl ? (
              <div
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-subtle)',
                  marginBottom: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={uploadedPhotoUrl}
                    alt="Packaging Artwork Preview"
                    style={{
                      maxHeight: '200px',
                      maxWidth: '100%',
                      borderRadius: 'var(--radius-sm)',
                      objectFit: 'contain',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  />
                  {isOcrProcessing && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.45)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 'var(--radius-sm)',
                        color: '#fff',
                        gap: '0.5rem',
                        fontSize: '0.8125rem',
                      }}
                    >
                      <RefreshCw size={24} className="spin-animation" />
                      <span>Extracting OCR declarations...</span>
                    </div>
                  )}
                </div>

                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', overflow: 'hidden' }}>
                    <ImageIcon size={16} color="var(--brand-blue)" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {uploadedFileName || 'Captured Photo'}
                    </span>
                  </div>
                  <Badge variant="COMPLIANT">Ready for Analysis</Badge>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCameraModalOpen(true)}
                    leftIcon={<RefreshCw size={14} />}
                    style={{ flex: 1 }}
                  >
                    Retake Photo
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleRemovePhoto}
                    leftIcon={<Trash2 size={14} />}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                style={{
                  border: isDragging ? '2px dashed var(--brand-blue)' : '2px dashed var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem 1rem',
                  textAlign: 'center',
                  backgroundColor: isDragging ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-subtle)',
                  marginBottom: '1rem',
                  transition: 'border-color 0.2s, background-color 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(37, 99, 235, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--brand-blue)',
                    }}
                  >
                    <Camera size={22} />
                  </div>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(100, 116, 139, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <UploadCloud size={22} />
                  </div>
                </div>

                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  Take Photo or Upload Packaging Label
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Drag & drop packaging artwork, capture live photo, or browse file (PDF, PNG, JPG)
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsCameraModalOpen(true)}
                    leftIcon={<Camera size={15} />}
                  >
                    Take Photo with Camera
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    leftIcon={<UploadCloud size={15} />}
                  >
                    Choose File
                  </Button>
                </div>
              </div>
            )}

            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <p><strong>Pre-Print Guidance:</strong></p>
              <p>
                Checking draft proofs before commercial plate printing saves costly repackaging, product recalls, and enforcement penal notices under Section 36 of the Legal Metrology Act, 2009.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handlePhotoCapture}
        title="Capture Packaging Artwork / Label"
      />

      {/* 5. PRE-PRINT READINESS SCORECARD BANNER */}
      {scorecard && report && (
        <div
          style={{
            backgroundColor: scorecard.bg,
            border: `1px solid ${scorecard.border}`,
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ color: scorecard.text }}>{scorecard.icon}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: scorecard.text, letterSpacing: '-0.01em' }}>
                    {scorecard.label}
                  </h3>
                  <Badge variant={scorecard.badgeVariant} size="sm">Pre-Check</Badge>
                </div>
                <p style={{ fontSize: '0.875rem', color: scorecard.text, marginTop: '0.2rem', fontWeight: 500 }}>
                  {scorecard.sublabel}
                </p>
              </div>
            </div>

            <div>
              <Button variant="secondary" size="sm" onClick={handlePrintChecklist} leftIcon={<Printer size={14} />}>
                Print Pre-Check Report
              </Button>
            </div>
          </div>

          {/* Quick Metrics Tally */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.6rem',
              paddingTop: '0.75rem',
              borderTop: `1px solid ${scorecard.border}`,
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            <span style={{ padding: '0.25rem 0.6rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              Mandatory Checks: {report.totalApplicableRules}
            </span>
            <span style={{ padding: '0.25rem 0.6rem', backgroundColor: '#ecfdf5', color: '#15803d', borderRadius: 'var(--radius-xs)', border: '1px solid #86efac' }}>
              ✅ Conforms: {report.passedCount}
            </span>
            <span style={{ padding: '0.25rem 0.6rem', backgroundColor: report.failedCount > 0 ? '#fef2f2' : 'var(--bg-surface)', color: report.failedCount > 0 ? '#b91c1c' : 'inherit', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              ❌ Needs Correction: {report.failedCount}
            </span>
            <span style={{ padding: '0.25rem 0.6rem', backgroundColor: report.uncertainCount > 0 ? '#fffbeb' : 'var(--bg-surface)', color: report.uncertainCount > 0 ? '#b45309' : 'inherit', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              ⚠️ Uncertain: {report.uncertainCount}
            </span>
            <span style={{ padding: '0.25rem 0.6rem', backgroundColor: 'var(--bg-surface)', color: '#64748b', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              — Missing on Panel: {report.notDetectedCount}
            </span>
          </div>
        </div>
      )}

      {/* 6. ISSUES TO REVIEW & PRE-PRINT CHECKLIST */}
      <Card padding="none">
        {/* Navigation Tabs */}
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div>
            <CardTitle>Pre-Print Packaging Quality Checklist</CardTitle>
            <CardDescription>
              Actionable checklist for graphic designers, regulatory affairs, and QA teams
            </CardDescription>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <Button
              variant={activeTab === 'CHECKLIST' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('CHECKLIST')}
              leftIcon={<CheckSquare size={14} />}
            >
              Issues to Review ({issuesToReview.length})
            </Button>
            <Button
              variant={activeTab === 'ALL_RULES' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('ALL_RULES')}
              leftIcon={<FileText size={14} />}
            >
              All Requirements ({report?.ruleResults.length || 0})
            </Button>
            <Button
              variant={activeTab === 'EXTRACTED' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('EXTRACTED')}
              leftIcon={<Layers size={14} />}
            >
              Detected Declarations
            </Button>
            <Button
              variant={activeTab === 'BARCODE' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveTab('BARCODE')}
              leftIcon={<Barcode size={14} />}
            >
              GS1 Barcode Intelligence
            </Button>
          </div>
        </div>

        {/* Tab 1: Issues to Review (Actionable Pre-Print Corrective Guidance) */}
        {activeTab === 'CHECKLIST' && (
          <div style={{ padding: '1.25rem' }}>
            {issuesToReview.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <CheckCircle2 size={40} color="#15803d" style={{ margin: '0 auto 0.5rem' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#15803d' }}>
                  No Pre-Print Issues Flagged
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.35rem', maxWidth: '480px', margin: '0.35rem auto 0' }}>
                  All mandatory Legal Metrology declarations conform to Rule 6 and 12 requirements. Proceed with regular pre-press proofing and physical sample inspection.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {issuesToReview.map((item) => (
                  <div
                    key={item.ruleId}
                    style={{
                      border: `1px solid ${item.status === 'FAIL' ? '#fca5a5' : '#fde68a'}`,
                      backgroundColor: item.status === 'FAIL' ? '#fef2f2' : '#fffbeb',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem 1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {item.status === 'FAIL' ? (
                          <span style={{ color: '#b91c1c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <AlertOctagon size={16} /> ❌ ACTION REQUIRED (Rule Failure)
                          </span>
                        ) : (
                          <span style={{ color: '#b45309', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <AlertTriangle size={16} /> ⚠️ REVISION RECOMMENDED
                          </span>
                        )}
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.ruleReference} &bull; {item.title}
                        </span>
                      </div>
                      <Badge variant={item.status === 'FAIL' ? 'NON_COMPLIANT' : 'FLAGGED'} size="sm">
                        {item.status === 'FAIL' ? 'Statutory Defect' : item.status === 'NOT_DETECTED' ? 'Missing on Panel' : 'Uncertain'}
                      </Badge>
                    </div>

                    <div style={{ marginTop: '0.6rem', fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                      <strong>Identified Finding:</strong> {item.reason}
                    </div>

                    {item.evidence.actualObserved && (
                      <div
                        style={{
                          marginTop: '0.4rem',
                          padding: '0.35rem 0.6rem',
                          backgroundColor: 'var(--bg-surface)',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <strong>Detected on draft:</strong> "{item.evidence.actualObserved}"
                      </div>
                    )}

                    {item.suggestedRemedy && (
                      <div
                        style={{
                          marginTop: '0.6rem',
                          padding: '0.5rem 0.75rem',
                          backgroundColor: 'rgba(37, 99, 235, 0.08)',
                          borderLeft: '3px solid var(--brand-blue)',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.75rem',
                          color: '#1e40af',
                          fontWeight: 500,
                        }}
                      >
                        <strong>Recommended Artwork Correction:</strong> {item.suggestedRemedy}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: All Rules Table */}
        {activeTab === 'ALL_RULES' && (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell style={{ width: '25%' }}>Rule Requirement</TableHeaderCell>
                <TableHeaderCell style={{ width: '18%' }}>Pre-Check Finding</TableHeaderCell>
                <TableHeaderCell style={{ width: '57%' }}>Details & Artwork Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report?.ruleResults.map((rule) => (
                <TableRow key={rule.ruleId}>
                  <TableCell>
                    <div style={{ fontWeight: 700, color: 'var(--brand-blue)' }}>{rule.ruleReference}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', marginTop: '0.15rem' }}>{rule.title}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={rule.status as any} size="sm">{rule.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div style={{ fontSize: '0.8125rem', color: rule.status === 'FAIL' ? '#b91c1c' : 'inherit' }}>
                      {rule.reason}
                    </div>
                    {rule.suggestedRemedy && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--brand-blue)', marginTop: '0.25rem' }}>
                        Guidance: {rule.suggestedRemedy}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Tab 3: Extracted Declarations */}
        {activeTab === 'EXTRACTED' && extraction && (
          <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <Card padding="sm">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Generic Name</span>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginTop: '0.2rem' }}>
                {extraction.productName.value?.genericName || 'Not Detected'}
              </h4>
              <Badge variant={extraction.productName.status === 'detected' ? 'COMPLIANT' : 'FLAGGED'} size="sm">
                {extraction.productName.status}
              </Badge>
            </Card>

            <Card padding="sm">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Manufacturer / Packer</span>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginTop: '0.2rem' }}>
                {extraction.manufacturerInfo.value?.name || 'Not Detected'}
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {extraction.manufacturerInfo.value?.fullAddress || 'Address missing'}
              </p>
              <Badge variant={extraction.manufacturerInfo.status === 'detected' ? 'COMPLIANT' : 'FLAGGED'} size="sm">
                PIN: {extraction.manufacturerInfo.value?.pinCode || 'Missing PIN'}
              </Badge>
            </Card>

            <Card padding="sm">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Declared Net Quantity</span>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginTop: '0.2rem' }}>
                {extraction.netQuantity.value?.numericValue ? `${extraction.netQuantity.value.numericValue} ${extraction.netQuantity.value.normalizedUnit}` : 'Not Detected'}
              </h4>
              <Badge variant={extraction.netQuantity.value?.isApproximatePrefixDetected ? 'NON_COMPLIANT' : 'COMPLIANT'} size="sm">
                {extraction.netQuantity.value?.isApproximatePrefixDetected ? 'Rule 12 Prohibited Modifier' : 'SI Metric Valid'}
              </Badge>
            </Card>

            <Card padding="sm">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Retail Sale Price & USP</span>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginTop: '0.2rem' }}>
                MRP: {extraction.mrp.value?.declaredAmount ? `₹ ${extraction.mrp.value.declaredAmount}` : 'Not Detected'}
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                USP: {extraction.unitSalePrice.value?.rate ? `₹ ${extraction.unitSalePrice.value.rate} / ${extraction.unitSalePrice.value.unit}` : 'Missing USP'}
              </p>
              <Badge variant={extraction.mrp.value?.isTaxInclusiveDeclared ? 'COMPLIANT' : 'NON_COMPLIANT'} size="sm">
                {extraction.mrp.value?.isTaxInclusiveDeclared ? 'Taxes Included' : 'Taxes Missing'}
              </Badge>
            </Card>
          </div>
        )}

        {/* Tab 4: Barcode & GS1 Intelligence */}
        {activeTab === 'BARCODE' && (
          <div style={{ padding: '1.25rem' }}>
            <BarcodeIntelligenceCard
              initialBarcode={extractBarcodeFromOcrText(rawText) || '8901063139466'}
              declaredManufacturer={extraction?.manufacturerInfo.value?.name || undefined}
              declaredCountry={extraction?.countryOfOrigin.value?.countryName || 'India'}
            />
          </div>
        )}
      </Card>
    </div>
  );
};
