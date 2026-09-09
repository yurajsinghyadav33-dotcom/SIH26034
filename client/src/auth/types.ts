import type { UserRole, UserSummary } from '@sih/shared';
import type { NavItemKey } from '../components/layout/Sidebar.js';

export type { UserRole };

export interface AuthUser extends UserSummary {
  token?: string;
  avatarInitials: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface IAuthService {
  login(credentials: LoginCredentials): Promise<AuthUser>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
}

// Role-based permissions mapping for navigation tabs
export const ROLE_NAV_PERMISSIONS: Record<UserRole, NavItemKey[]> = {
  ADMIN: [
    'Dashboard',
    'Scan Product',
    'Pre-Check',
    'Inspections',
    'Products',
    'Violations',
    'Reports',
    'Analytics',
    'Rules',
    'Settings',
  ],
  ENFORCEMENT_INSPECTOR: [
    'Dashboard',
    'Scan Product',
    'Pre-Check',
    'Inspections',
    'Products',
    'Violations',
    'Reports',
    'Rules',
  ],
  REVIEWER: [
    'Dashboard',
    'Pre-Check',
    'Inspections',
    'Violations',
    'Reports',
    'Analytics',
    'Rules',
  ],
};

export const ROLE_LABELS: Record<UserRole, { title: string; badgeColor: string }> = {
  ADMIN: {
    title: 'System Administrator',
    badgeColor: '#7c3aed',
  },
  ENFORCEMENT_INSPECTOR: {
    title: 'Enforcement Inspector',
    badgeColor: 'var(--brand-blue)',
  },
  REVIEWER: {
    title: 'Legal Metrology Reviewer',
    badgeColor: '#059669',
  },
};
