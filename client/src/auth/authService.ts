import type { AuthUser, IAuthService, LoginCredentials, UserRole } from './types.js';

export const DEMO_CREDENTIALS: Record<UserRole, { user: AuthUser; defaultPass: string }> = {
  ADMIN: {
    defaultPass: 'Admin@2026',
    user: {
      id: 'USR-ADMIN-01',
      name: 'Director S. K. Sharma',
      email: 'admin@legalmetrology.gov.in',
      role: 'ADMIN',
      department: 'Central Enforcement Directorate',
      badgeNumber: 'LMO-HQ-001',
      jurisdiction: 'National Headquarters, New Delhi',
      avatarInitials: 'SK',
    },
  },
  ENFORCEMENT_INSPECTOR: {
    defaultPass: 'Inspector@2026',
    user: {
      id: 'USR-INSP-402',
      name: 'Inspector Y. S. Yadav',
      email: 'inspector@legalmetrology.gov.in',
      role: 'ENFORCEMENT_INSPECTOR',
      department: 'Zonal Surveillance & Inspection',
      badgeNumber: 'LMO-ND-402',
      jurisdiction: 'Northern Regional Zone, Delhi NCR',
      avatarInitials: 'YY',
    },
  },
  REVIEWER: {
    defaultPass: 'Reviewer@2026',
    user: {
      id: 'USR-REV-108',
      name: 'Dr. Ananya Sen',
      email: 'reviewer@legalmetrology.gov.in',
      role: 'REVIEWER',
      department: 'Legal Standards & Statutory Review',
      badgeNumber: 'LMO-REV-108',
      jurisdiction: 'Appellate & Legal Metrology Review Wing',
      avatarInitials: 'AS',
    },
  },
};

const STORAGE_KEY = 'sih_lm_auth_user';

export class MockAuthService implements IAuthService {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    // Simulate brief network latency for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 400));

    const email = credentials.email.trim().toLowerCase();

    // Match against pre-configured roles
    const matchedRole = (Object.keys(DEMO_CREDENTIALS) as UserRole[]).find(
      (role) => DEMO_CREDENTIALS[role].user.email.toLowerCase() === email
    );

    if (!matchedRole) {
      throw new Error('Invalid credentials. No government officer record found for this email address.');
    }

    const { user, defaultPass } = DEMO_CREDENTIALS[matchedRole];

    if (credentials.password !== defaultPass && credentials.password !== 'password') {
      throw new Error('Incorrect password. Please verify credentials or contact Zonal IT Administration.');
    }

    const authenticatedUser: AuthUser = {
      ...user,
      token: `mock_jwt_token_${user.id}_${Date.now()}`,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));
    return authenticatedUser;
  }

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    localStorage.removeItem(STORAGE_KEY);
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as AuthUser;
    } catch {
      return null;
    }
  }
}

export const authService: IAuthService = new MockAuthService();
