import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, AlertTriangle, Upload, Check, Focus } from 'lucide-react';
import { Modal } from './Modal.js';
import { Button } from './Button.js';

export interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string, file: File) => void;
  title?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Packaging Surface Camera Capture',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileFallbackRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);

  const stopTracks = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    stopTracks();
    setError(null);
    setIsInitializing(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera hardware access is not supported by this browser. Please upload a photo instead.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('[CameraCaptureModal] Camera initialization error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission was denied. Please allow camera access in your browser settings or select an image file directly.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No active camera device detected on this system. You can choose a photo from your local files.');
      } else {
        setError(err.message || 'Unable to access camera. Please upload an image file instead.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, [stopTracks]);

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen && !capturedPreview) {
      startCamera(facingMode);
    } else if (!isOpen) {
      stopTracks();
      setCapturedPreview(null);
      setCapturedFile(null);
      setError(null);
    }

    return () => {
      stopTracks();
    };
  }, [isOpen, startCamera, facingMode, stopTracks, capturedPreview]);

  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `packaging_scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setCapturedPreview(dataUrl);
      setCapturedFile(file);
      stopTracks();
    }, 'image/jpeg', 0.92);
  };

  const handleConfirmPhoto = () => {
    if (capturedPreview && capturedFile) {
      onCapture(capturedPreview, capturedFile);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedPreview(null);
    setCapturedFile(null);
    startCamera(facingMode);
  };

  const handleToggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  const handleFileFallbackSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCapturedPreview(dataUrl);
      setCapturedFile(file);
      stopTracks();
    };
    reader.readAsDataURL(file);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopTracks();
        onClose();
      }}
      title={title}
      description="Position the Principal Display Panel (PDP) within the target frame for statutory OCR inspection."
      maxWidth="720px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              stopTracks();
              onClose();
            }}
          >
            Cancel
          </Button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {capturedPreview ? (
              <>
                <Button variant="outline" size="sm" onClick={handleRetake} leftIcon={<RefreshCw size={14} />}>
                  Retake Photo
                </Button>
                <Button variant="primary" size="sm" onClick={handleConfirmPhoto} leftIcon={<Check size={14} />}>
                  Use This Photo
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileFallbackRef.current?.click()}
                  leftIcon={<Upload size={14} />}
                >
                  Choose File Instead
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCaptureSnapshot}
                  disabled={Boolean(error) || isInitializing}
                  leftIcon={<Camera size={15} />}
                >
                  Capture Photo
                </Button>
              </>
            )}
          </div>
        </div>
      }
    >
      <input
        type="file"
        ref={fileFallbackRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileFallbackSelect}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Error Notification */}
        {error && (
          <div
            style={{
              padding: '0.85rem 1.25rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle size={20} color="#b91c1c" />
              <div style={{ fontSize: '0.8125rem', color: '#991b1b' }}>
                <span style={{ fontWeight: 600 }}>Camera Unavailable</span>
                <p style={{ marginTop: '0.15rem' }}>{error}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileFallbackRef.current?.click()}
              leftIcon={<Upload size={14} />}
            >
              Upload Photo
            </Button>
          </div>
        )}

        {/* Viewfinder or Captured Preview */}
        <div
          style={{
            position: 'relative',
            height: '380px',
            backgroundColor: '#020617',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--border-strong)',
          }}
        >
          {capturedPreview ? (
            <img
              src={capturedPreview}
              alt="Captured packaging preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: error ? 'none' : 'block',
                }}
              />

              {/* Viewfinder Target Framing Overlay */}
              {!error && (
                <div
                  style={{
                    position: 'absolute',
                    top: '12%',
                    left: '12%',
                    right: '12%',
                    bottom: '12%',
                    border: '2px dashed rgba(255, 255, 255, 0.75)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      padding: '0.35rem 0.75rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.65)',
                      borderRadius: 'var(--radius-sm)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Focus size={13} color="#38bdf8" />
                    <span>Align Principal Display Panel</span>
                  </div>
                </div>
              )}

              {/* Switch Camera Button (Top Right Overlay) */}
              {!error && (
                <button
                  type="button"
                  onClick={handleToggleCamera}
                  title="Switch camera (Front/Back)"
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    padding: '0.45rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: '#ffffff',
                    borderRadius: '50%',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <RefreshCw size={16} />
                </button>
              )}

              {/* Shutter Trigger Button (Bottom Center Overlay) */}
              {!error && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                >
                  <button
                    type="button"
                    onClick={handleCaptureSnapshot}
                    title="Take Photo"
                    style={{
                      width: '58px',
                      height: '58px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      border: '4px solid var(--brand-blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                      transition: 'transform 0.1s ease',
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.92)')}
                    onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <Camera size={26} color="var(--brand-blue)" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
