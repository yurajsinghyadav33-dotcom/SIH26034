import React, { useState, useEffect, useRef } from 'react';
import {
  ScanLine,
  UploadCloud,
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  FileCheck,
  HelpCircle,
  Layers,
  WifiOff,
  HardDriveDownload,
  RotateCcw,
  CheckCircle2,
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
  InspectionScannerStage,
  BarcodeIntelligenceCard,
} from '../components/ui/index.js';
import { COMPLIANCE_TEST_SAMPLES, ComplianceTestSample } from '../data/complianceSamples.js';
import {
  analyzeCommodityCompliance,
  ComplianceAnalysisResult,
  performImageOcr,
} from '../services/complianceClient.js';
import { saveScanAsInspection } from '../services/inspectionClient.js';
import { useNetworkSync } from '../offline/NetworkSyncContext.js';
import { extractBarcodeFromOcrText } from '../services/barcodeService.js';
import type { RuleValidationResult, RuleValidationStatus } from '@sih/shared';

export const ScanProductView: React.FC = () => {
  const {
    connectionStatus,
    enqueueInspection,
    activeDraft,
    saveDraft,
    clearDraft,
  } = useNetworkSync();

  const [selectedSampleId, setSelectedSampleId] = useState<string>('SAMPLE_COMPLIANT');
  const [rawText, setRawText] = useState<string>(COMPLIANCE_TEST_SAMPLES[0].payload.rawText);
  const [pdpHeight, setPdpHeight] = useState<number>(18.5);
  const [pdpWidth, setPdpWidth] = useState<number>(12.0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeResultTab, setActiveResultTab] = useState<'ALL' | 'FAIL' | 'UNCERTAIN' | 'EXTRACTED' | 'BARCODE'>('ALL');
  const [analysisResult, setAnalysisResult] = useState<ComplianceAnalysisResult | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState<boolean>(false);
  const [queuedNotification, setQueuedNotification] = useState<string | null>(null);

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
        await executeAnalysis(ocrResult.rawText);
      } else {
        await executeAnalysis(rawText);
      }
    } catch (err) {
      console.error('Error processing packaging image:', err);
      await executeAnalysis(rawText);
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

  // Check and restore active draft on mount if available
  useEffect(() => {
    if (activeDraft && activeDraft.rawText && activeDraft.rawText !== COMPLIANCE_TEST_SAMPLES[0].payload.rawText) {
      setRawText(activeDraft.rawText);
      if (activeDraft.pdpHeight) {
        setPdpHeight(activeDraft.pdpHeight);
      } else if (activeDraft.pdpDimensions) {
        setPdpHeight(activeDraft.pdpDimensions.heightMm / 10);
      }
      if (activeDraft.pdpWidth) {
        setPdpWidth(activeDraft.pdpWidth);
      } else if (activeDraft.pdpDimensions) {
        setPdpWidth(activeDraft.pdpDimensions.widthMm / 10);
      }
      if (activeDraft.selectedSampleId) {
        setSelectedSampleId(activeDraft.selectedSampleId);
      }
      setDraftRestored(true);
      executeAnalysis(activeDraft.rawText);
    } else {
      executeAnalysis(COMPLIANCE_TEST_SAMPLES[0].payload.rawText);
    }
  }, []);

  // Auto-save draft to local storage on input modifications
  useEffect(() => {
    saveDraft({
      rawText,
      pdpHeight,
      pdpWidth,
      pdpDimensions: {
        heightMm: pdpHeight * 10,
        widthMm: pdpWidth * 10,
        areaSqCm: Math.round(pdpHeight * pdpWidth * 10) / 10,
      },
      selectedSampleId,
      lastUpdated: new Date().toISOString(),
    });
  }, [rawText, pdpHeight, pdpWidth, selectedSampleId, saveDraft]);

  const handleSelectSample = (sample: ComplianceTestSample) => {
    setSelectedSampleId(sample.id);
    setRawText(sample.payload.rawText);
    if (sample.payload.pdpDimensions) {
      setPdpHeight(sample.payload.pdpDimensions.heightMm / 10);
      setPdpWidth(sample.payload.pdpDimensions.widthMm / 10);
    }
    setDraftRestored(false);
    executeAnalysis(sample.payload.rawText);
  };

  const handleDiscardRestoredDraft = () => {
    clearDraft();
    setDraftRestored(false);
    handleSelectSample(COMPLIANCE_TEST_SAMPLES[0]);
  };

  const executeAnalysis = async (textToAnalyze: string) => {
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
      setSavedId(null);
    } catch {
      // In offline / network failure, keep whatever current state exists
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQueueOffline = () => {
    const item = enqueueInspection(
      {
        rawText,
        pdpDimensions: {
          heightMm: pdpHeight * 10,
          widthMm: pdpWidth * 10,
          areaSqCm: Math.round(pdpHeight * pdpWidth * 10) / 10,
        },
      },
      `Field Scan (${new Date().toLocaleTimeString()})`
    );
    setQueuedNotification(`Draft saved to offline queue (${item.draftId}). Will auto-sync when online.`);
    setTimeout(() => setQueuedNotification(null), 5000);
  };

  const handleSaveToHistory = async () => {
    if (!analysisResult) return;
    setIsSaving(true);

    // If offline, store directly in offline queue without attempting remote network call
    if (connectionStatus === 'OFFLINE') {
      const item = enqueueInspection(
        { rawText },
        `Field Inspection (${new Date().toLocaleTimeString()})`
      );
      setSavedId(item.draftId);
      setQueuedNotification(`Buffered to local queue as ${item.draftId}. Will synchronize when back online.`);
      setIsSaving(false);
      return;
    }

    try {
      const id = await saveScanAsInspection({
        rawText,
      });
      setSavedId(id);
    } catch {
      // Network dropped during save — safeguard by queueing locally
      const item = enqueueInspection(
        { rawText },
        `Field Inspection (${new Date().toLocaleTimeString()})`
      );
      setSavedId(item.draftId);
      setQueuedNotification(`Network failed. Safely buffered to offline queue (${item.draftId}).`);
    } finally {
      setIsSaving(false);
    }
  };

  const getOverallBadge = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return {
          label: 'COMPLIANT',
          icon: <ShieldCheck size={28} />,
          bg: 'var(--status-compliant-bg)',
          text: 'var(--status-compliant-text)',
          border: 'var(--status-compliant-border)',
          description: 'All mandatory Legal Metrology declarations conform to Rules 2011 and amendments.',
        };
      case 'NON_COMPLIANT':
        return {
          label: 'NON-COMPLIANT',
          icon: <AlertOctagon size={28} />,
          bg: 'var(--status-noncompliant-bg)',
          text: 'var(--status-noncompliant-text)',
          border: 'var(--status-noncompliant-border)',
          description: 'Statutory non-compliance detected. Subject to penal notice under Section 36 of LM Act, 2009.',
        };
      case 'FLAGGED_FOR_REVIEW':
      case 'INCOMPLETE_DATA':
      default:
        return {
          label: 'NEEDS REVIEW',
          icon: <AlertTriangle size={28} />,
          bg: 'var(--status-flagged-bg)',
          text: 'var(--status-flagged-text)',
          border: 'var(--status-flagged-border)',
          description: 'Ambiguous or unconfirmed declarations detected. Requires physical verification before legal adjudication.',
        };
    }
  };

  const renderStatusSymbol = (status: RuleValidationStatus) => {
    switch (status) {
      case 'PASS':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#15803d', fontWeight: 700 }}>
            ✅ PASS
          </span>
        );
      case 'FAIL':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#b91c1c', fontWeight: 700 }}>
            ❌ FAIL
          </span>
        );
      case 'UNCERTAIN':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#b45309', fontWeight: 700 }}>
            ⚠️ UNCERTAIN
          </span>
        );
      case 'NOT_DETECTED':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontWeight: 700 }}>
            — NOT DETECTED
          </span>
        );
      case 'NOT_APPLICABLE':
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontWeight: 600 }}>
            ⚪ NOT APPLICABLE
          </span>
        );
    }
  };

  const report = analysisResult?.report;
  const extraction = analysisResult?.extraction;
  const overallBadge = report ? getOverallBadge(report.overallStatus) : null;

  const filteredRules: RuleValidationResult[] = report
    ? report.ruleResults.filter((r) => {
        if (activeResultTab === 'FAIL') return r.status === 'FAIL';
        if (activeResultTab === 'UNCERTAIN') return r.status === 'UNCERTAIN' || r.status === 'NOT_DETECTED';
        return true;
      })
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Field Usability & Connectivity Banners */}
      {connectionStatus === 'OFFLINE' && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <WifiOff size={20} color="#b45309" />
            <div style={{ fontSize: '0.8125rem' }}>
              <span style={{ fontWeight: 600, color: '#92400e' }}>
                Offline Mode Active — Field Resiliency Enabled
              </span>
              <p style={{ color: '#b45309', marginTop: '0.15rem' }}>
                Signal is weak or disconnected. All captured transcript text and measurements are auto-saved locally. You can buffer inspections to the offline queue for auto-sync once reconnected.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleQueueOffline}
            leftIcon={<HardDriveDownload size={14} />}
          >
            Buffer to Offline Queue
          </Button>
        </div>
      )}

      {draftRestored && (
        <div
          style={{
            padding: '0.75rem 1.25rem',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8125rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand-navy)', fontWeight: 500 }}>
            <CheckCircle2 size={16} color="var(--brand-blue)" />
            <span>Restored active inspection draft from local device storage.</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDiscardRestoredDraft}
            leftIcon={<RotateCcw size={13} />}
          >
            Discard & Reset Sample
          </Button>
        </div>
      )}

      {queuedNotification && (
        <div
          style={{
            padding: '0.75rem 1.25rem',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8125rem',
            color: '#15803d',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={16} color="#16a34a" />
          <span>{queuedNotification}</span>
        </div>
      )}

      {/* 1. PIPELINE FLOW STEPPER */}
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
        <span style={{ color: 'var(--brand-blue)' }}>1. Image Upload</span>
        <span>&rarr;</span>
        <span style={{ color: 'var(--brand-blue)' }}>2. OCR Ingestion</span>
        <span>&rarr;</span>
        <span style={{ color: 'var(--brand-blue)' }}>3. Information Extraction</span>
        <span>&rarr;</span>
        <span style={{ color: 'var(--brand-blue)' }}>4. Applicable Rules Filter</span>
        <span>&rarr;</span>
        <span style={{ color: 'var(--brand-blue)' }}>5. Rule Validation</span>
        <span>&rarr;</span>
        <span
          style={{
            backgroundColor: overallBadge ? overallBadge.bg : 'var(--bg-subtle)',
            color: overallBadge ? overallBadge.text : 'inherit',
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-xs)',
            border: `1px solid ${overallBadge ? overallBadge.border : 'var(--border-subtle)'}`,
          }}
        >
          6. {overallBadge ? overallBadge.label : 'Result'}
        </span>
      </div>

      {/* 2. PRE-LOADED TEST SAMPLE PICKER */}
      <Card padding="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Select Verified Evaluation Sample:
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              1-Click instant execution across test scenarios
            </span>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {COMPLIANCE_TEST_SAMPLES.map((sample) => {
              const isSelected = selectedSampleId === sample.id;
              return (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
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
                    <Badge variant={sample.expectedVerdict === 'COMPLIANT' ? 'COMPLIANT' : sample.expectedVerdict === 'NON-COMPLIANT' ? 'NON_COMPLIANT' : 'FLAGGED'} size="sm">
                      {sample.expectedVerdict}
                    </Badge>
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

      {/* 3. INPUT / OCR SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
        <Card>
          <CardHeader>
            <CardTitle>Packaging OCR Transcript Input</CardTitle>
            <Badge variant="INFO">Rule 6 Scanned Data</Badge>
          </CardHeader>
          <CardContent>
            <FormField>
              <Label>Scanned Label Raw Text (Editable for Testing)</Label>
              <Textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                style={{ minHeight: '140px', fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}
                placeholder="Paste or edit packaging OCR text here..."
              />
            </FormField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
              <FormField>
                <Label>PDP Height (cm)</Label>
                <Input type="number" step="0.5" value={pdpHeight} onChange={(e) => setPdpHeight(Number(e.target.value))} />
              </FormField>
              <FormField>
                <Label>PDP Width (cm)</Label>
                <Input type="number" step="0.5" value={pdpWidth} onChange={(e) => setPdpWidth(Number(e.target.value))} />
              </FormField>
              <FormField>
                <Label>Calculated PDP Area</Label>
                <Input readOnly value={`${Math.round(pdpHeight * pdpWidth * 10) / 10} cm²`} style={{ backgroundColor: 'var(--bg-subtle)', fontWeight: 600 }} />
              </FormField>
            </div>
          </CardContent>
          <CardFooter>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                size="md"
                isLoading={isAnalyzing}
                onClick={() => executeAnalysis(rawText)}
                leftIcon={<ScanLine size={16} />}
              >
                Run Compliance Analysis
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={handleQueueOffline}
                leftIcon={<HardDriveDownload size={16} />}
              >
                Save to Offline Queue
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Dropzone & Panel Guidelines */}
        <Card depth="elevated">
          <CardHeader>
            <CardTitle>Commodity Surface Capture • 3D Optical Stage</CardTitle>
            <Badge variant="NEUTRAL">Panel 1</Badge>
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

            {/* 3D Holographic AI Scanner Stage */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              style={{
                marginBottom: '1rem',
                border: isDragging ? '2px dashed var(--brand-blue)' : '2px solid transparent',
                borderRadius: 'var(--radius-md)',
                transition: 'border-color 0.2s ease',
              }}
            >
              <InspectionScannerStage
                imageUrl={uploadedPhotoUrl}
                isScanning={isAnalyzing || isOcrProcessing}
                fileName={uploadedFileName}
                pdpDimensionsText={`${Math.round(pdpHeight * pdpWidth * 10) / 10} cm² PDP Area`}
                statusBadgeText={uploadedPhotoUrl ? "Surface Calibrated" : "Optical Standby"}
              />
            </div>

            {/* Action Bar for Surface Photo Controls */}
            {uploadedPhotoUrl ? (
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.375rem', overflow: 'hidden' }}>
                  <ImageIcon size={15} color="var(--brand-blue)" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {uploadedFileName || 'Captured Surface Photo'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCameraModalOpen(true)}
                    leftIcon={<RefreshCw size={13} />}
                  >
                    Retake
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleRemovePhoto}
                    leftIcon={<Trash2 size={13} />}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCameraModalOpen(true)}
                  leftIcon={<Camera size={15} />}
                >
                  Take Live Photo with Camera
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<UploadCloud size={15} />}
                >
                  Browse File (PNG, JPG, WebP)
                </Button>
              </div>
            )}

            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <p><strong>Note on Missing Declarations:</strong></p>
              <p>
                If a mandatory declaration (e.g. manufacturing date) is on another panel not scanned, it will appear as <strong>— NOT DETECTED</strong> and status will be <strong>NEEDS REVIEW</strong>. It is not marked as a confirmed violation until all panels are examined.
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
        title="Scan Commodity Packaging Surface"
      />

      {/* 4. OVERALL STATUS BANNER */}
      {overallBadge && report && (
        <div
          style={{
            backgroundColor: overallBadge.bg,
            border: `1px solid ${overallBadge.border}`,
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--depth-shadow-2)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ color: overallBadge.text }}>{overallBadge.icon}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: overallBadge.text, letterSpacing: '-0.01em' }}>
                    OVERALL STATUS: {overallBadge.label}
                  </h2>
                  <Badge variant="INFO" size="sm">Rules 2011 Engine v{report.ruleVersion}</Badge>
                </div>
                <p style={{ fontSize: '0.875rem', color: overallBadge.text, marginTop: '0.2rem', fontWeight: 500 }}>
                  {overallBadge.description}
                </p>
              </div>
            </div>

            {/* Statutory Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {overallBadge.label === 'NON-COMPLIANT' && (
                <Button variant="danger" size="sm" leftIcon={<AlertOctagon size={14} />}>
                  Draft Section 36 Notice
                </Button>
              )}
              {overallBadge.label === 'COMPLIANT' && (
                <Button variant="primary" size="sm" leftIcon={<FileCheck size={14} />}>
                  Generate LM-1 Certificate
                </Button>
              )}
              {overallBadge.label === 'NEEDS REVIEW' && (
                <Button variant="secondary" size="sm" leftIcon={<HelpCircle size={14} />}>
                  Physical Verification Checklist
                </Button>
              )}

              <Button
                variant={savedId ? 'secondary' : 'outline'}
                size="sm"
                isLoading={isSaving}
                onClick={handleSaveToHistory}
                disabled={Boolean(savedId)}
              >
                {savedId ? `✓ Saved (${savedId})` : 'Save to History'}
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
              borderTop: `1px solid ${overallBadge.border}`,
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            <span style={{ padding: '0.25rem 0.6rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              Total Applicable: {report.totalApplicableRules}
            </span>
            <span style={{ padding: '0.25rem 0.6rem', backgroundColor: '#ecfdf5', color: '#15803d', borderRadius: 'var(--radius-xs)', border: '1px solid #86efac' }}>
              ✅ Passed: {report.passedCount}
            </span>
            <span style={{ padding: '0.25rem 0.6rem', backgroundColor: report.failedCount > 0 ? '#fef2f2' : 'var(--bg-surface)', color: report.failedCount > 0 ? '#b91c1c' : 'inherit', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              ❌ Failed: {report.failedCount}
            </span>
            <span style={{ padding: '0.25rem 0.6rem', backgroundColor: report.uncertainCount > 0 ? '#fffbeb' : 'var(--bg-surface)', color: report.uncertainCount > 0 ? '#b45309' : 'inherit', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              ⚠️ Uncertain: {report.uncertainCount}
            </span>
            <span style={{ padding: '0.25rem 0.6rem', backgroundColor: 'var(--bg-surface)', color: '#64748b', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              — Not Detected: {report.notDetectedCount}
            </span>
            <span style={{ padding: '0.25rem 0.6rem', backgroundColor: 'var(--bg-surface)', color: '#64748b', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              ⚪ Not Applicable: {report.notApplicableCount}
            </span>
          </div>
        </div>
      )}

      {/* 5. CHECKED REQUIREMENTS & RESULTS */}
      <Card padding="none">
        {/* Results Navigation Tabs */}
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
            <CardTitle>Legal Metrology Checked Requirements</CardTitle>
            <CardDescription>
              Verified against Legal Metrology (Packaged Commodities) Rules, 2011 and official amendments
            </CardDescription>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <Button
              variant={activeResultTab === 'ALL' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveResultTab('ALL')}
            >
              All Requirements ({report?.ruleResults.length || 0})
            </Button>
            <Button
              variant={activeResultTab === 'FAIL' ? 'danger' : 'secondary'}
              size="sm"
              onClick={() => setActiveResultTab('FAIL')}
            >
              Failed Checks ({report?.failedCount || 0})
            </Button>
            <Button
              variant={activeResultTab === 'UNCERTAIN' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveResultTab('UNCERTAIN')}
            >
              Uncertain / Missing ({((report?.uncertainCount || 0) + (report?.notDetectedCount || 0))})
            </Button>
            <Button
              variant={activeResultTab === 'EXTRACTED' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveResultTab('EXTRACTED')}
              leftIcon={<Layers size={14} />}
            >
              Extracted Entities
            </Button>
            <Button
              variant={activeResultTab === 'BARCODE' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveResultTab('BARCODE')}
              leftIcon={<Barcode size={14} />}
            >
              GS1 Barcode Intelligence
            </Button>
          </div>
        </div>

        {/* Tab Content: Requirements Table */}
        {activeResultTab !== 'EXTRACTED' && activeResultTab !== 'BARCODE' && (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell style={{ width: '22%' }}>Requirement</TableHeaderCell>
                <TableHeaderCell style={{ width: '16%' }}>Status</TableHeaderCell>
                <TableHeaderCell style={{ width: '12%' }}>Confidence</TableHeaderCell>
                <TableHeaderCell style={{ width: '50%' }}>Evidence & Statutory Reason</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRules.map((rule) => (
                <TableRow key={rule.ruleId}>
                  {/* Requirement Column */}
                  <TableCell>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {rule.ruleReference}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--brand-blue)', marginTop: '0.15rem' }}>
                      {rule.title}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {rule.statutoryReference}
                    </div>
                  </TableCell>

                  {/* Status Column */}
                  <TableCell>
                    {renderStatusSymbol(rule.status)}
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Severity: {rule.severity}
                    </div>
                  </TableCell>

                  {/* Confidence Column */}
                  <TableCell>
                    {rule.evidence.confidence !== null && rule.evidence.confidence !== undefined ? (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.8125rem' }}>
                          <span style={{ color: rule.evidence.confidence >= 85 ? '#15803d' : '#d97706' }}>
                            {rule.evidence.confidence}%
                          </span>
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          {rule.evidence.confidence >= 85 ? 'High Confidence' : 'Review Advised'}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                    )}
                  </TableCell>

                  {/* Evidence & Reason Column */}
                  <TableCell>
                    <p style={{ fontSize: '0.8125rem', color: rule.status === 'FAIL' ? '#b91c1c' : rule.status === 'UNCERTAIN' ? '#b45309' : 'var(--text-primary)', fontWeight: rule.status === 'FAIL' ? 600 : 400 }}>
                      {rule.reason}
                    </p>
                    {rule.evidence.actualObserved && (
                      <div
                        style={{
                          marginTop: '0.35rem',
                          padding: '0.35rem 0.55rem',
                          backgroundColor: 'var(--bg-subtle)',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <strong>Detected on package:</strong> {rule.evidence.actualObserved}
                      </div>
                    )}
                    {rule.suggestedRemedy && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--brand-blue)', marginTop: '0.3rem' }}>
                        <strong>Remedy / Action:</strong> {rule.suggestedRemedy}
                      </p>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Tab Content: Extracted Entities Dossier */}
        {activeResultTab === 'EXTRACTED' && extraction && (
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
                PIN: {extraction.manufacturerInfo.value?.pinCode || 'None'}
              </Badge>
            </Card>

            <Card padding="sm">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Declared Net Quantity</span>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginTop: '0.2rem' }}>
                {extraction.netQuantity.value?.numericValue ? `${extraction.netQuantity.value.numericValue} ${extraction.netQuantity.value.normalizedUnit}` : 'Not Detected'}
              </h4>
              <Badge variant={extraction.netQuantity.value?.isApproximatePrefixDetected ? 'NON_COMPLIANT' : 'COMPLIANT'} size="sm">
                {extraction.netQuantity.value?.isApproximatePrefixDetected ? 'Approx Modifier' : 'SI Metric Valid'}
              </Badge>
            </Card>

            <Card padding="sm">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Retail Pricing (MRP & USP)</span>
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

            <Card padding="sm">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Consumer Redressal</span>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginTop: '0.2rem' }}>
                Phone: {extraction.consumerCare.value?.phone || 'Missing'}
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Email: {extraction.consumerCare.value?.email || 'Missing'}
              </p>
              <Badge variant={extraction.consumerCare.value?.phone ? 'COMPLIANT' : 'NON_COMPLIANT'} size="sm">
                {extraction.consumerCare.value?.phone ? 'Helpline Present' : 'Helpline Absent'}
              </Badge>
            </Card>

            <Card padding="sm">
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dates & Batch</span>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, marginTop: '0.2rem' }}>
                Mfg/Pkd: {extraction.dates.value?.dateOfManufacture?.dateString || extraction.dates.value?.dateOfPackaging?.dateString || 'Not Detected'}
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Batch: {extraction.dates.value?.batchOrLotNumber || 'None'}
              </p>
              <Badge variant="INFO" size="sm">
                Exp: {extraction.dates.value?.expiryDate?.dateString || 'N/A'}
              </Badge>
            </Card>
          </div>
        )}

        {/* Tab Content: GS1 Barcode Intelligence */}
        {activeResultTab === 'BARCODE' && (
          <div style={{ padding: '1.25rem' }}>
            <BarcodeIntelligenceCard
              initialBarcode={extractBarcodeFromOcrText(rawText) || '8901063139466'}
              declaredManufacturer={analysisResult?.extraction.manufacturerInfo.value?.name || undefined}
              declaredCountry={analysisResult?.extraction.countryOfOrigin.value?.countryName || 'India'}
            />
          </div>
        )}
      </Card>
    </div>
  );
};
