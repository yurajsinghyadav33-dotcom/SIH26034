import React, { useState, useRef, useCallback } from 'react';
import { Focus } from 'lucide-react';
import { Badge } from './Badge.js';

export interface InspectionScannerStageProps {
  imageUrl?: string | null;
  isScanning?: boolean;
  onRetake?: () => void;
  onUploadClick?: () => void;
  onCameraClick?: () => void;
  fileName?: string | null;
  pdpDimensionsText?: string;
  statusBadgeText?: string;
}

export const InspectionScannerStage: React.FC<InspectionScannerStageProps> = ({
  imageUrl,
  isScanning = false,
  fileName,
  pdpDimensionsText = 'Principal Display Panel',
  statusBadgeText = 'Optical Ready',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Calculate subtle 3D tilt (max 4.5 degrees)
    const rotateX = ((y - centerY) / centerY) * -4.5;
    const rotateY = ((x - centerX) / centerX) * 4.5;
    setTilt({ x: rotateX, y: rotateY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        perspective: '1200px',
        margin: '0 auto',
      }}
    >
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="scanner-grid-bg"
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(37, 99, 235, 0.25)',
          backgroundColor: '#0b1329',
          boxShadow: isScanning
            ? '0 12px 36px -4px rgba(2, 132, 199, 0.3), inset 0 0 32px rgba(2, 132, 199, 0.12)'
            : 'var(--depth-shadow-2)',
          padding: '1.25rem',
          minHeight: '260px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out, box-shadow 0.3s ease',
        }}
      >
        {/* Holographic HUD Header Bar */}
        <div
          style={{
            position: 'absolute',
            top: '0.65rem',
            left: '0.85rem',
            right: '0.85rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 15,
            fontSize: '0.6875rem',
            letterSpacing: '0.04em',
            color: 'rgba(148, 163, 184, 0.9)',
            fontFamily: 'var(--font-mono)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Focus size={13} color="var(--laser-cyan)" />
            <span>AI LEGAL METROLOGY SCANNER • STAGE 3D</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isScanning && (
              <span
                style={{
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#38bdf8',
                    display: 'inline-block',
                    animation: 'pulse 1.2s infinite',
                  }}
                />
                OPTICAL OCR ENGAGED
              </span>
            )}
            <Badge variant="INFO" size="sm">{statusBadgeText}</Badge>
          </div>
        </div>

        {/* 4 Optical Corner Alignment Brackets */}
        <div style={{ position: 'absolute', top: 8, left: 8, width: 14, height: 14, borderTop: '2px solid var(--laser-cyan)', borderLeft: '2px solid var(--laser-cyan)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 8, right: 8, width: 14, height: 14, borderTop: '2px solid var(--laser-cyan)', borderRight: '2px solid var(--laser-cyan)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 8, left: 8, width: 14, height: 14, borderBottom: '2px solid var(--laser-cyan)', borderLeft: '2px solid var(--laser-cyan)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 8, right: 8, width: 14, height: 14, borderBottom: '2px solid var(--laser-cyan)', borderRight: '2px solid var(--laser-cyan)', pointerEvents: 'none' }} />

        {/* Center Target Crosshair */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '180px',
            height: '180px',
            border: '1px dashed rgba(56, 189, 248, 0.2)',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        />

        {/* Laser Scanning Line Sweep */}
        {isScanning && <div className="scanner-laser-line" />}

        {/* Packaging Preview Container or Placeholder */}
        {imageUrl ? (
          <div
            style={{
              position: 'relative',
              zIndex: 12,
              marginTop: '1.75rem',
              marginBottom: '0.75rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              maxWidth: '90%',
              transform: 'translateZ(20px)',
            }}
          >
            <div
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                backgroundColor: 'rgba(0,0,0,0.3)',
              }}
            >
              <img
                src={imageUrl}
                alt="Captured Commodity"
                style={{
                  maxHeight: '190px',
                  maxWidth: '100%',
                  display: 'block',
                  objectFit: 'contain',
                }}
              />
              {/* Scan Overlay Vignette */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  boxShadow: 'inset 0 0 16px rgba(2, 132, 199, 0.4)',
                  pointerEvents: 'none',
                }}
              />
            </div>
            <div
              style={{
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: '#e2e8f0',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center',
              }}
            >
              <span>{fileName || 'commodity_panel_1.jpg'}</span>
              <span style={{ color: '#94a3b8' }}>•</span>
              <span style={{ color: '#38bdf8' }}>{pdpDimensionsText}</span>
            </div>
          </div>
        ) : (
          <div
            style={{
              zIndex: 12,
              marginTop: '1.5rem',
              marginBottom: '0.5rem',
              textAlign: 'center',
              color: '#94a3b8',
              transform: 'translateZ(10px)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                margin: '0 auto 0.75rem',
                backgroundColor: 'rgba(2, 132, 199, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
                boxShadow: '0 0 20px rgba(2, 132, 199, 0.25)',
              }}
            >
              <Focus size={28} />
            </div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.25rem' }}>
              Position Commodity Surface within Target
            </p>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', maxWidth: '340px', margin: '0 auto' }}>
              Align Principal Display Panel (PDP) for sub-millimeter typography and statutory declaration extraction
            </p>
          </div>
        )}

        {/* Optical Footer Measurement Guides */}
        <div
          style={{
            position: 'absolute',
            bottom: '0.65rem',
            left: '0.85rem',
            right: '0.85rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 15,
            fontSize: '0.6875rem',
            color: 'rgba(148, 163, 184, 0.8)',
            fontFamily: 'var(--font-mono)',
            pointerEvents: 'none',
          }}
        >
          <span>AXIS: X-0 / Y-0 (PDP CALIBRATED)</span>
          <span>OPTICAL RESOLUTION: 1080P FHD</span>
        </div>
      </div>
    </div>
  );
};
