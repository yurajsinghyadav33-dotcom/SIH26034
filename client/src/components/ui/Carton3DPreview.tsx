import React, { useState, useRef } from 'react';
import { Box, RefreshCw } from 'lucide-react';
import { Badge } from './Badge.js';

export interface Carton3DPreviewProps {
  heightCm: number;
  widthCm: number;
  depthCm?: number;
  pdpAreaCm2?: number;
  title?: string;
}

export const Carton3DPreview: React.FC<Carton3DPreviewProps> = ({
  heightCm = 18.5,
  widthCm = 12.0,
  depthCm = 6.0,
  pdpAreaCm2 = 222,
  title = '3D Packaging Carton Representation',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [rotation, setRotation] = useState<{ x: number; y: number }>({ x: -12, y: 24 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    setRotation((prev) => ({
      x: Math.max(-45, Math.min(45, prev.x - deltaY * 0.4)),
      y: prev.y + deltaX * 0.4,
    }));
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetRotation = () => setRotation({ x: -12, y: 24 });

  // Scale dimensions proportionally for viewport
  const maxDim = Math.max(heightCm, widthCm, depthCm, 10);
  const scale = 140 / maxDim;
  const boxH = Math.max(60, Math.min(180, Math.round(heightCm * scale)));
  const boxW = Math.max(60, Math.min(180, Math.round(widthCm * scale)));
  const boxD = Math.max(40, Math.min(140, Math.round(depthCm * scale)));

  return (
    <div
      style={{
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        boxShadow: 'var(--depth-shadow-1)',
        overflow: 'hidden',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          padding: '0.75rem 1rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Box size={16} color="var(--brand-blue)" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {title}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Badge variant="INFO" size="sm">Rule 6 3D Proof</Badge>
          <button
            onClick={resetRotation}
            title="Reset 3D Orientation"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.2rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* 3D Viewport Stage */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          height: '240px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: '900px',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          backgroundColor: '#0f172a',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient floor grid */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at center, rgba(37, 99, 235, 0.2) 0%, transparent 70%)',
            transform: 'rotateX(80deg) translateZ(-40px)',
            pointerEvents: 'none',
          }}
        />

        {/* 3D Carton Object */}
        <div
          style={{
            width: `${boxW}px`,
            height: `${boxH}px`,
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: isDragging ? 'none' : 'transform 0.25s ease-out',
          }}
        >
          {/* Front Face (Principal Display Panel) */}
          <div
            style={{
              position: 'absolute',
              width: `${boxW}px`,
              height: `${boxH}px`,
              backgroundColor: 'rgba(30, 58, 138, 0.85)',
              border: '2px solid #38bdf8',
              boxShadow: 'inset 0 0 20px rgba(56, 189, 248, 0.3)',
              transform: `translateZ(${boxD / 2}px)`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '0.5rem',
              color: '#ffffff',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: '#38bdf8', fontWeight: 700 }}>
                PRINCIPAL PANEL (PDP)
              </span>
              <span style={{ fontSize: '0.5625rem', backgroundColor: '#2563eb', padding: '1px 4px', borderRadius: '2px' }}>
                40% STATUTORY
              </span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.02em' }}>
                COMMODITY FACE
              </p>
              <p style={{ fontSize: '0.625rem', color: '#93c5fd', fontFamily: 'var(--font-mono)' }}>
                {heightCm}cm × {widthCm}cm
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.5625rem', color: '#cbd5e1' }}>
              <span>Rule 6(1)</span>
              <span>{pdpAreaCm2} cm²</span>
            </div>
          </div>

          {/* Back Face */}
          <div
            style={{
              position: 'absolute',
              width: `${boxW}px`,
              height: `${boxH}px`,
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              transform: `rotateY(180deg) translateZ(${boxD / 2}px)`,
              boxSizing: 'border-box',
            }}
          />

          {/* Right Face */}
          <div
            style={{
              position: 'absolute',
              width: `${boxD}px`,
              height: `${boxH}px`,
              left: `${(boxW - boxD) / 2}px`,
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              transform: `rotateY(90deg) translateZ(${boxW / 2}px)`,
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              fontSize: '0.5625rem',
              fontFamily: 'var(--font-mono)',
            }}
          >
            SIDE PANEL
          </div>

          {/* Left Face */}
          <div
            style={{
              position: 'absolute',
              width: `${boxD}px`,
              height: `${boxH}px`,
              left: `${(boxW - boxD) / 2}px`,
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              transform: `rotateY(-90deg) translateZ(${boxW / 2}px)`,
              boxSizing: 'border-box',
            }}
          />

          {/* Top Face */}
          <div
            style={{
              position: 'absolute',
              width: `${boxW}px`,
              height: `${boxD}px`,
              top: `${(boxH - boxD) / 2}px`,
              backgroundColor: '#334155',
              border: '1px solid #475569',
              transform: `rotateX(90deg) translateZ(${boxH / 2}px)`,
              boxSizing: 'border-box',
            }}
          />

          {/* Bottom Face */}
          <div
            style={{
              position: 'absolute',
              width: `${boxW}px`,
              height: `${boxD}px`,
              top: `${(boxH - boxD) / 2}px`,
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              transform: `rotateX(-90deg) translateZ(${boxH / 2}px)`,
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Drag Helper Tip */}
        <div
          style={{
            position: 'absolute',
            bottom: '0.5rem',
            left: '0.75rem',
            fontSize: '0.625rem',
            fontFamily: 'var(--font-mono)',
            color: '#64748b',
            pointerEvents: 'none',
          }}
        >
          DRAG TO ROTATE 3D WIREFRAME
        </div>
      </div>

      {/* Footer Metrics */}
      <div
        style={{
          padding: '0.6rem 1rem',
          backgroundColor: 'var(--bg-subtle)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
        }}
      >
        <span>Area: <strong>{pdpAreaCm2} cm²</strong></span>
        <span>Aspect Ratio: <strong>{(widthCm / (heightCm || 1)).toFixed(2)}:1</strong></span>
        <span style={{ color: 'var(--brand-blue)', fontWeight: 600 }}>Rule 6(1) PDP Active</span>
      </div>
    </div>
  );
};
