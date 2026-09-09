import React from 'react';
import {
  LayoutDashboard,
  ScanLine,
  ClipboardList,
  Package,
  AlertOctagon,
  FileSpreadsheet,
  BarChart3,
  BookOpen,
  Settings,
  Scale,
  Shield,
  Printer,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext.js';
import { ROLE_NAV_PERMISSIONS, UserRole } from '../../auth/types.js';

export type NavItemKey =
  | 'Dashboard'
  | 'Scan Product'
  | 'Pre-Check'
  | 'Inspections'
  | 'Products'
  | 'Violations'
  | 'Reports'
  | 'Analytics'
  | 'Rules'
  | 'Settings';

export interface SidebarProps {
  activeTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  isOpen: boolean;
  onCloseMobile?: () => void;
}

interface NavItemConfig {
  key: NavItemKey;
  label: string;
  icon: React.ComponentType<{ size?: number | string; color?: string; className?: string }>;
  badgeCount?: number;
}

const ALL_NAV_ITEMS: NavItemConfig[] = [
  { key: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'Scan Product', label: 'Scan Product', icon: ScanLine },
  { key: 'Pre-Check', label: 'Pre-Print Check', icon: Printer },
  { key: 'Inspections', label: 'Inspections', icon: ClipboardList, badgeCount: 42 },
  { key: 'Products', label: 'Products', icon: Package },
  { key: 'Violations', label: 'Violations', icon: AlertOctagon, badgeCount: 7 },
  { key: 'Reports', label: 'Reports', icon: FileSpreadsheet },
  { key: 'Analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'Rules', label: 'Rules Engine', icon: BookOpen },
  { key: 'Settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onCloseMobile,
}) => {
  const { user, switchDemoRole } = useAuth();

  // Filter navigation items by active user role
  const allowedKeys = user ? ROLE_NAV_PERMISSIONS[user.role] : [];
  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => allowedKeys.includes(item.key));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            zIndex: 150,
            display: 'block',
          }}
          className="sidebar-backdrop"
        />
      )}

      <aside
        style={{
          width: '260px',
          backgroundColor: 'var(--sidebar-bg)',
          color: 'var(--sidebar-text)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          borderRight: '1px solid #1e293b',
          zIndex: 200,
          transition: 'transform 0.2s ease',
          height: '100vh',
          position: 'sticky',
          top: 0,
        }}
      >
        {/* Government Authority Branding */}
        <div
          style={{
            padding: '1.25rem 1.25rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--brand-blue)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Scale size={20} />
          </div>
          <div>
            <h2
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.2,
                letterSpacing: '0.01em',
              }}
            >
              LEGAL METROLOGY
            </h2>
            <p
              style={{
                fontSize: '0.6875rem',
                color: 'var(--brand-saffron)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Govt. of India &bull; SIH26034
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav
          style={{
            flex: 1,
            padding: '1rem 0.75rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          <div
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: '#64748b',
              padding: '0.5rem 0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Enforcement Core</span>
            {user && (
              <span style={{ color: '#94a3b8', fontSize: '0.625rem' }}>
                {user.role === 'ADMIN' ? 'FULL ACCESS' : 'RESTRICTED'}
              </span>
            )}
          </div>

          {visibleNavItems.map((item) => {
            const isActive = activeTab === item.key;
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                onClick={() => {
                  onSelectTab(item.key);
                  if (onCloseMobile) onCloseMobile();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? 'var(--sidebar-active)' : 'transparent',
                  transition: 'background-color 0.15s ease, color 0.15s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--sidebar-hover)';
                    (e.currentTarget as HTMLElement).style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = '#94a3b8';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Icon size={16} color={isActive ? '#ffffff' : '#94a3b8'} />
                  <span>{item.label}</span>
                </div>
                {item.badgeCount !== undefined && (
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      padding: '0.1rem 0.4rem',
                      borderRadius: '10px',
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(148, 163, 184, 0.15)',
                      color: isActive ? '#ffffff' : '#94a3b8',
                    }}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Role Quick Switcher for Testing & Statutory Info */}
        <div
          style={{
            padding: '0.85rem 1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: '#090d16',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Active Role Switcher
            </span>
            <Shield size={12} color="var(--brand-saffron)" />
          </div>

          <select
            value={user?.role || 'ENFORCEMENT_INSPECTOR'}
            onChange={(e) => switchDemoRole(e.target.value as UserRole)}
            style={{
              width: '100%',
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: 'var(--radius-xs)',
              padding: '0.35rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: 500,
            }}
          >
            <option value="ADMIN">Admin (All 9 Modules)</option>
            <option value="ENFORCEMENT_INSPECTOR">Inspector (Scan & Notice)</option>
            <option value="REVIEWER">Reviewer (Audit & Reports)</option>
          </select>

          <p style={{ marginTop: '0.5rem', fontSize: '0.625rem', color: '#475569' }}>
            Role-Based Access Control (RBAC) Active
          </p>
        </div>
      </aside>
    </>
  );
};
