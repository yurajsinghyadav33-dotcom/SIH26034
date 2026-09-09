import React, { useState } from 'react';
import {
  ShieldCheck,
  Menu,
  LogOut,
  ChevronDown,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  Clock,
  Trash2,
  CheckCircle2,
  HardDriveDownload,
} from 'lucide-react';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { Modal } from '../ui/Modal.js';
import { useAuth } from '../../auth/AuthContext.js';
import { ROLE_LABELS } from '../../auth/types.js';
import { useNetworkSync } from '../../offline/NetworkSyncContext.js';

export interface HeaderProps {
  onToggleSidebar?: () => void;
  activeNavTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, activeNavTitle }) => {
  const { user, logout } = useAuth();
  const {
    connectionStatus,
    queuedItems,
    pendingCount,
    lastSyncTime,
    syncAllQueued,
    retryFailedItems,
    removeQueuedItem,
    isSimulatedOffline,
    setSimulatedOffline,
  } = useNetworkSync();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSyncingManual, setIsSyncingManual] = useState(false);

  const roleMeta = user ? ROLE_LABELS[user.role] : null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setShowProfileModal(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncingManual(true);
    try {
      await syncAllQueued();
    } finally {
      setIsSyncingManual(false);
    }
  };

  const renderConnectionBadge = () => {
    switch (connectionStatus) {
      case 'ONLINE':
        return (
          <button
            onClick={() => setShowQueueModal(true)}
            title="Online - Connected to Central Enforcement Registry (Click to inspect local cache)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.55rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: 'rgba(34, 197, 94, 0.12)',
              color: '#15803d',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#16a34a',
                display: 'inline-block',
              }}
            />
            <Wifi size={13} />
            <span>Online</span>
          </button>
        );

      case 'OFFLINE':
        return (
          <button
            onClick={() => setShowQueueModal(true)}
            title="Offline - Intermittent network. Inspection drafts stored locally (Click to manage)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.55rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: '#b45309',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              cursor: 'pointer',
              animation: 'pulse 2s infinite',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#f59e0b',
                display: 'inline-block',
              }}
            />
            <WifiOff size={13} />
            <span>Offline{pendingCount > 0 ? ` (${pendingCount})` : ''}</span>
          </button>
        );

      case 'SYNCING':
        return (
          <button
            onClick={() => setShowQueueModal(true)}
            title="Syncing pending drafts with registry..."
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.55rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              color: '#1d4ed8',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} style={{ animation: 'spin 1.5s linear infinite' }} />
            <span>Syncing{pendingCount > 0 ? ` (${pendingCount})` : ''}</span>
          </button>
        );

      case 'FAILED_SYNC':
        return (
          <button
            onClick={() => setShowQueueModal(true)}
            title="Failed sync - Some items could not be uploaded. Click to retry."
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.55rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#b91c1c',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              cursor: 'pointer',
            }}
          >
            <AlertTriangle size={13} />
            <span>Failed sync{pendingCount > 0 ? ` (${pendingCount})` : ''}</span>
          </button>
        );
    }
  };

  return (
    <>
      <header
        style={{
          height: '60px',
          backgroundColor: 'var(--header-bg)',
          borderBottom: '1px solid var(--header-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Left: Mobile Toggle & Page Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.4rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
            }}
          >
            <Menu size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                fontWeight: 500,
              }}
            >
              PORTAL &bull;
            </span>
            <h1
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              {activeNavTitle}
            </h1>
          </div>
        </div>

        {/* Right: Connectivity Status, Engine Badge, User Profile & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Connection Status Badge */}
          {renderConnectionBadge()}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Badge variant="COMPLIANT" size="sm" icon={<ShieldCheck size={12} />}>
              Rules 2011 v2011.1
            </Badge>
          </div>

          <div
            style={{
              height: '24px',
              width: '1px',
              backgroundColor: 'var(--border-subtle)',
            }}
          />

          {/* User Profile Trigger Area */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button
                onClick={() => setShowProfileModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.3rem 0.65rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-strong)',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--brand-navy)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {user.avatarInitials}
                </div>
                <div style={{ lineHeight: 1.2 }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {user.name}
                  </p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--brand-blue)', fontWeight: 600 }}>
                    {roleMeta?.title}
                  </p>
                </div>
                <ChevronDown size={14} color="var(--text-muted)" />
              </button>

              {/* Direct Quick Logout Button */}
              <button
                onClick={handleLogout}
                title="Sign out from enforcement portal"
                style={{
                  padding: '0.45rem',
                  borderRadius: 'var(--radius-sm)',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--status-noncompliant-bg)',
                  border: '1px solid var(--status-noncompliant-border)',
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* User Profile Dossier Modal */}
      {user && (
        <Modal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          title="Officer Profile Dossier"
          description="Legal Metrology Department Credentials & Jurisdiction"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setShowProfileModal(false)}>
                Close
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleLogout}
                isLoading={isLoggingOut}
                leftIcon={<LogOut size={14} />}
              >
                Sign Out
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--brand-navy)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.125rem',
                  fontWeight: 700,
                }}
              >
                {user.avatarInitials}
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.name}
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {user.email}
                </p>
                <div style={{ marginTop: '0.25rem' }}>
                  <Badge variant="INFO" size="sm">
                    {roleMeta?.title}
                  </Badge>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.8125rem' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Officer ID / Badge: </span>
                <p style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{user.badgeNumber || 'N/A'}</p>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Department: </span>
                <p style={{ fontWeight: 600 }}>{user.department}</p>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Official Jurisdiction: </span>
                <p style={{ fontWeight: 600 }}>{user.jurisdiction || 'National Enforcement Wing'}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Field Connectivity & Offline Queue Manager Modal */}
      <Modal
        isOpen={showQueueModal}
        onClose={() => setShowQueueModal(false)}
        title="Field Connectivity & Offline Queue Manager"
        description="Local inspection draft queue & synchronization status for intermittent field signals"
        footer={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {pendingCount === 0 ? 'Queue clean' : `${pendingCount} item(s) pending sync`}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="secondary" size="sm" onClick={() => setShowQueueModal(false)}>
                Close
              </Button>
              {queuedItems.some((i) => i.status === 'FAILED') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryFailedItems}
                  isLoading={isSyncingManual}
                  leftIcon={<RefreshCw size={14} />}
                >
                  Retry Failed
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleManualSync}
                isLoading={isSyncingManual || connectionStatus === 'SYNCING'}
                disabled={connectionStatus === 'OFFLINE' || pendingCount === 0}
                leftIcon={<HardDriveDownload size={14} />}
              >
                Sync Now
              </Button>
            </div>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Honest Architectural Disclosure Callout */}
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--brand-navy)', marginBottom: '0.25rem' }}>
              <HardDriveDownload size={16} color="var(--brand-blue)" />
              <span>Architectural Disclosure & Field Reliability Guarantee</span>
            </div>
            Local device storage safely buffers captured product images, PDP dimensions, and inspection notes during intermittent field network coverage. Statutory rule validations and OCR extractions execute deterministically via the central enforcement engine upon reconnection.
          </div>

          {/* Connection Status Overview Card */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              padding: '0.85rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8125rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Network State</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {connectionStatus === 'ONLINE' && <Badge variant="COMPLIANT" size="sm">Online (Connected)</Badge>}
                {connectionStatus === 'OFFLINE' && <Badge variant="FLAGGED" size="sm">Offline (Intermittent)</Badge>}
                {connectionStatus === 'SYNCING' && <Badge variant="INFO" size="sm">Syncing in Progress</Badge>}
                {connectionStatus === 'FAILED_SYNC' && <Badge variant="NON_COMPLIANT" size="sm">Failed Sync</Badge>}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Last Registry Sync</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                <Clock size={13} color="var(--text-muted)" />
                {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'Not yet synced in session'}
              </div>
            </div>

            {/* Offline Simulation Toggle */}
            <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-subtle)' }}>
              <div>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Simulate Field Offline Mode</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Test offline queue buffering and local draft persistence without turning off system Wi-Fi.
                </p>
              </div>
              <Button
                variant={isSimulatedOffline ? 'danger' : 'outline'}
                size="sm"
                onClick={() => setSimulatedOffline?.(!isSimulatedOffline)}
              >
                {isSimulatedOffline ? 'Disable Simulation' : 'Enable Offline Simulation'}
              </Button>
            </div>
          </div>

          {/* Queued Items List */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h5 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Local Inspection Draft Queue ({queuedItems.length})
              </h5>
            </div>

            {queuedItems.length === 0 ? (
              <div
                style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px dashed var(--border-subtle)',
                }}
              >
                <CheckCircle2 size={24} color="#16a34a" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Local Queue is Clear
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  All inspection drafts and captured label scans have been synchronized with the Central Metrology Registry.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
                {queuedItems.map((item) => (
                  <div
                    key={item.draftId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-strong)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.title}
                        </span>
                        {item.status === 'QUEUED' && <Badge variant="PENDING" size="sm">QUEUED</Badge>}
                        {item.status === 'SYNCING' && <Badge variant="INFO" size="sm">SYNCING</Badge>}
                        {item.status === 'SYNCED' && <Badge variant="COMPLIANT" size="sm">SYNCED</Badge>}
                        {item.status === 'FAILED' && <Badge variant="NON_COMPLIANT" size="sm">FAILED</Badge>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        <span>Captured: {new Date(item.createdAt).toLocaleTimeString()}</span>
                        {item.retryCount > 0 && <span>Retries: {item.retryCount}</span>}
                        {item.errorDetails && <span style={{ color: '#dc2626' }}>{item.errorDetails}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => removeQueuedItem(item.draftId)}
                      title="Discard local draft"
                      style={{
                        padding: '0.35rem',
                        color: 'var(--text-muted)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};
