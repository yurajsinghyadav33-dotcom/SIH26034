import React, { useState } from 'react';
import { Scale, KeyRound } from 'lucide-react';
import { useAuth } from '../auth/AuthContext.js';
import { DEMO_CREDENTIALS } from '../auth/authService.js';
import type { UserRole } from '../auth/types.js';
import {
  Card,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Label,
  FormField,
  Badge,
  AlertBanner,
} from '../components/ui/index.js';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('inspector@legalmetrology.gov.in');
  const [password, setPassword] = useState('Inspector@2026');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ENFORCEMENT_INSPECTOR');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const demo = DEMO_CREDENTIALS[role];
    setEmail(demo.user.email);
    setPassword(demo.defaultPass);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--sidebar-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      {/* Portal Branding Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', maxWidth: '480px' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            backgroundColor: 'var(--brand-blue)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
          }}
        >
          <Scale size={32} />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Legal Metrology Enforcement Portal
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>
          Compliance Verification System under Legal Metrology Rules, 2011
        </p>
        <div style={{ display: 'inline-block', marginTop: '0.75rem' }}>
          <Badge variant="FLAGGED" size="sm">
            Govt. of India &bull; SIH26034 Official Access
          </Badge>
        </div>
      </div>

      {/* Login Card */}
      <Card padding="lg" style={{ width: '100%', maxWidth: '440px', backgroundColor: 'var(--bg-surface)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <CardTitle style={{ fontSize: '1.125rem' }}>Officer Authentication</CardTitle>
            <CardDescription>
              Sign in with your designated department credentials or select an evaluation role below.
            </CardDescription>
          </div>

          {errorMsg && (
            <AlertBanner
              type="error"
              title="Access Denied"
              message={errorMsg}
              onClose={() => setErrorMsg(null)}
            />
          )}

          {/* Quick Demo Role Selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <Label style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Select Verification Role:
            </Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem', marginTop: '0.35rem' }}>
              <button
                type="button"
                onClick={() => handleRoleSelect('ADMIN')}
                style={{
                  padding: '0.45rem 0.35rem',
                  fontSize: '0.75rem',
                  fontWeight: selectedRole === 'ADMIN' ? 600 : 500,
                  backgroundColor: selectedRole === 'ADMIN' ? 'var(--brand-blue)' : 'var(--bg-subtle)',
                  color: selectedRole === 'ADMIN' ? '#ffffff' : 'var(--text-primary)',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-strong)',
                  textAlign: 'center',
                }}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('ENFORCEMENT_INSPECTOR')}
                style={{
                  padding: '0.45rem 0.35rem',
                  fontSize: '0.75rem',
                  fontWeight: selectedRole === 'ENFORCEMENT_INSPECTOR' ? 600 : 500,
                  backgroundColor: selectedRole === 'ENFORCEMENT_INSPECTOR' ? 'var(--brand-blue)' : 'var(--bg-subtle)',
                  color: selectedRole === 'ENFORCEMENT_INSPECTOR' ? '#ffffff' : 'var(--text-primary)',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-strong)',
                  textAlign: 'center',
                }}
              >
                Inspector
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('REVIEWER')}
                style={{
                  padding: '0.45rem 0.35rem',
                  fontSize: '0.75rem',
                  fontWeight: selectedRole === 'REVIEWER' ? 600 : 500,
                  backgroundColor: selectedRole === 'REVIEWER' ? 'var(--brand-blue)' : 'var(--bg-subtle)',
                  color: selectedRole === 'REVIEWER' ? '#ffffff' : 'var(--text-primary)',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-strong)',
                  textAlign: 'center',
                }}
              >
                Reviewer
              </button>
            </div>
          </div>

          <FormField>
            <Label required>Government Email ID / Badge</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@legalmetrology.gov.in"
              required
            />
          </FormField>

          <FormField>
            <Label required>Security Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
          </FormField>

          <div style={{ marginTop: '1.5rem' }}>
            <Button
              type="submit"
              variant="primary"
              size="md"
              style={{ width: '100%' }}
              isLoading={isSubmitting}
              leftIcon={<KeyRound size={16} />}
            >
              Sign In to Enforcement Portal
            </Button>
          </div>
        </form>
      </Card>

      {/* Statutory Legal Disclaimer */}
      <div
        style={{
          marginTop: '1.5rem',
          maxWidth: '440px',
          textAlign: 'center',
          fontSize: '0.6875rem',
          color: '#64748b',
          lineHeight: 1.5,
        }}
      >
        <p>
          <strong>Statutory Warning:</strong> Authorized Official Use Only. All activities, product scans, and compliance determinations are digitally signed and audited under the Legal Metrology Act, 2009.
        </p>
      </div>
    </div>
  );
};
