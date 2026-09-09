import React from 'react';
import { Save } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Input,
  Select,
  Label,
  FormField,
  Badge,
} from '../components/ui/index.js';

export const SettingsView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
      <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Enforcement Authority Settings
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Manage Legal Metrology Officer profile, rule engine versioning, and inspection parameters.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Officer Credentials & Jurisdiction</CardTitle>
          <Badge variant="INFO">Enforcement Officer</Badge>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField>
              <Label>Officer Full Name</Label>
              <Input defaultValue="Yuvraj Singh Yadav" />
            </FormField>
            <FormField>
              <Label>Designation / Badge Number</Label>
              <Input defaultValue="Legal Metrology Officer (LMO-ND-402)" />
            </FormField>
            <FormField>
              <Label>Enforcement Zonal Division</Label>
              <Input defaultValue="Northern Regional Directorate, New Delhi" />
            </FormField>
            <FormField>
              <Label>Official Email</Label>
              <Input defaultValue="officer.delhi@legalmetrology.gov.in" />
            </FormField>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="primary" size="sm" leftIcon={<Save size={14} />}>
            Save Profile
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Engine Configuration</CardTitle>
          <Badge variant="COMPLIANT">v2011.1 Active</Badge>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormField>
              <Label>Legal Metrology Rule Engine Version</Label>
              <Select defaultValue="2011.1">
                <option value="2011.1">LMR 2011 + 2021 USP Amendments (v2011.1)</option>
                <option value="2011.0">LMR 2011 Base Standard (v2011.0)</option>
              </Select>
            </FormField>
            <FormField>
              <Label>OCR Minimum Confidence Threshold (%)</Label>
              <Input type="number" defaultValue="85" />
            </FormField>
            <FormField>
              <Label>Font Height Tolerance Margin (mm)</Label>
              <Input type="number" step="0.1" defaultValue="0.2" />
            </FormField>
            <FormField>
              <Label>Automatic Notice Generation</Label>
              <Select defaultValue="MANUAL">
                <option value="MANUAL">Manual Approval Required</option>
                <option value="AUTO">Auto-draft on Critical Violations</option>
              </Select>
            </FormField>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="primary" size="sm" leftIcon={<Save size={14} />}>
            Update Engine Configuration
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
