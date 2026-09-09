import React, { useState, useEffect } from 'react';
import {
  Eye,
  Search,
  ShieldCheck,
  AlertOctagon,
  RotateCcw,
  CheckCircle2,
  Layers,
  FileText,
  Printer,
} from 'lucide-react';
import {
  Card,
  Button,
  Input,
  Select,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Modal,
  EmptyState,
} from '../components/ui/index.js';
import {
  getInspections,
  getInspectionById,
  InspectionListItem,
  InspectionDetailsDossier,
} from '../services/inspectionClient.js';

export const InspectionsView: React.FC = () => {
  const [inspections, setInspections] = useState<InspectionListItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(8);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterDateRange, setFilterDateRange] = useState<string>('ALL');

  // Inspection Details Modal
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);
  const [selectedDossier, setSelectedDossier] = useState<InspectionDetailsDossier | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [activeDetailsTab, setActiveDetailsTab] = useState<'RULES' | 'VIOLATIONS' | 'DECLARATIONS'>('RULES');

  // Fetch Inspections List
  useEffect(() => {
    loadInspections();
  }, [currentPage, filterStatus, filterDateRange]);

  const loadInspections = async () => {
    setIsLoading(true);
    try {
      let startDate: string | undefined;
      const now = Date.now();
      if (filterDateRange === 'TODAY') {
        startDate = new Date(now - 86400000).toISOString();
      } else if (filterDateRange === '7_DAYS') {
        startDate = new Date(now - 7 * 86400000).toISOString();
      } else if (filterDateRange === '30_DAYS') {
        startDate = new Date(now - 30 * 86400000).toISOString();
      }

      const res = await getInspections({
        search: searchQuery,
        status: filterStatus,
        startDate,
        page: currentPage,
        limit: pageSize,
      });

      setInspections(res.items);
      setTotalRecords(res.total);
      setTotalPages(res.totalPages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadInspections();
  };

  const handleOpenDetails = async (id: string) => {
    setSelectedInspectionId(id);
    setIsLoadingDetails(true);
    try {
      const dossier = await getInspectionById(id);
      setSelectedDossier(dossier);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedInspectionId(null);
    setSelectedDossier(null);
    setActiveDetailsTab('RULES');
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return <Badge variant="COMPLIANT" size="sm">COMPLIANT</Badge>;
      case 'NON_COMPLIANT':
        return <Badge variant="NON_COMPLIANT" size="sm">NON-COMPLIANT</Badge>;
      case 'FLAGGED_FOR_REVIEW':
      case 'INCOMPLETE_DATA':
      case 'FLAGGED':
      default:
        return <Badge variant="FLAGGED" size="sm">NEEDS REVIEW</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* 1. SEARCH & FILTER BAR */}
      <Card padding="sm">
        <form onSubmit={handleSearchSubmit}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Search Input */}
            <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '320px' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Input
                  placeholder="Search by Commodity, Brand, SKU or Inspection ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" variant="primary" size="md" leftIcon={<Search size={15} />}>
                Search
              </Button>
            </div>

            {/* Filter Dropdowns */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ width: '180px' }}>
                <Select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="ALL">All Verdicts</option>
                  <option value="COMPLIANT">✅ Compliant</option>
                  <option value="NON_COMPLIANT">❌ Non-Compliant</option>
                  <option value="NEEDS REVIEW">⚠️ Needs Review</option>
                </Select>
              </div>

              <div style={{ width: '170px' }}>
                <Select
                  value={filterDateRange}
                  onChange={(e) => {
                    setFilterDateRange(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="ALL">All Inspection Dates</option>
                  <option value="TODAY">Last 24 Hours</option>
                  <option value="7_DAYS">Last 7 Days</option>
                  <option value="30_DAYS">Last 30 Days</option>
                </Select>
              </div>

              {(searchQuery || filterStatus !== 'ALL' || filterDateRange !== 'ALL') && (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('ALL');
                    setFilterDateRange('ALL');
                    setCurrentPage(1);
                  }}
                  leftIcon={<RotateCcw size={14} />}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>

      {/* 2. INSPECTION HISTORY TABLE OR EMPTY STATE */}
      {inspections.length === 0 && !isLoading ? (
        <EmptyState
          title="No Inspection Records Found"
          description={`No recorded Legal Metrology inspections match your search criteria. Try adjusting filters or search terms.`}
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('ALL');
                setFilterDateRange('ALL');
                setCurrentPage(1);
              }}
            >
              Clear All Filters
            </Button>
          }
        />
      ) : (
        <Card padding="none">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell style={{ width: '16%' }}>Inspection ID</TableHeaderCell>
                <TableHeaderCell style={{ width: '22%' }}>Commodity & Brand</TableHeaderCell>
                <TableHeaderCell style={{ width: '10%' }}>Category</TableHeaderCell>
                <TableHeaderCell style={{ width: '14%' }}>Batch & Date</TableHeaderCell>
                <TableHeaderCell style={{ width: '12%' }}>Declared Price</TableHeaderCell>
                <TableHeaderCell style={{ width: '12%' }}>Status</TableHeaderCell>
                <TableHeaderCell style={{ width: '8%' }}>Violations</TableHeaderCell>
                <TableHeaderCell style={{ width: '6%', textAlign: 'right' }}>Action</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inspections.map((item) => (
                <TableRow key={item.inspectionId}>
                  {/* Inspection ID */}
                  <TableCell>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-blue)' }}>
                      {item.inspectionId}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {new Date(item.inspectedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </TableCell>

                  {/* Commodity & Brand */}
                  <TableCell>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                      {item.productName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Brand: <strong>{item.brand}</strong>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Badge variant="NEUTRAL" size="sm">{item.category}</Badge>
                  </TableCell>

                  {/* Batch & Date */}
                  <TableCell style={{ fontSize: '0.8125rem' }}>
                    <div style={{ fontFamily: 'var(--font-mono)' }}>{item.batchNumber}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mfg: {item.dateOfManufacture}</div>
                  </TableCell>

                  {/* Price */}
                  <TableCell style={{ fontSize: '0.8125rem' }}>
                    <div style={{ fontWeight: 600 }}>{item.mrp}</div>
                    {item.unitSalePrice && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>USP: {item.unitSalePrice}</div>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {renderStatusBadge(item.overallStatus)}
                  </TableCell>

                  {/* Violations */}
                  <TableCell>
                    {item.totalViolations > 0 ? (
                      <span style={{ color: '#b91c1c', fontWeight: 700, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <AlertOctagon size={14} /> {item.totalViolations}
                      </span>
                    ) : (
                      <span style={{ color: '#15803d', fontWeight: 600, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={14} /> 0
                      </span>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell style={{ textAlign: 'right' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDetails(item.inspectionId)}
                      leftIcon={<Eye size={13} />}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* 3. PAGINATION BAR */}
          <div
            style={{
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <span>
              Showing <strong>{inspections.length}</strong> of <strong>{totalRecords}</strong> registered inspections
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 4. COMPREHENSIVE INSPECTION DETAILS MODAL */}
      <Modal
        isOpen={Boolean(selectedInspectionId)}
        onClose={handleCloseDetails}
        title={`Inspection Dossier: ${selectedDossier?.inspection.inspectionId || selectedInspectionId}`}
        description="Official Legal Metrology Packaged Commodities Rule 6 & 12 Compliance Record"
        maxWidth="960px"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              SHA-256 Checksum: {selectedDossier?.scan.imageHash?.slice(0, 16)}...
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="outline" size="sm" onClick={() => window.print()} leftIcon={<Printer size={14} />}>
                Print Dossier / PDF
              </Button>
              <Button variant="secondary" size="sm" onClick={handleCloseDetails}>
                Close Dossier
              </Button>
            </div>
          </div>
        }
      >
        {isLoadingDetails || !selectedDossier ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading inspection records...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Top Row: Surface Image & Product Profile */}
            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1rem' }}>
              {/* Product Surface Capture Image */}
              <div
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Scanned Packaging Surface
                </div>
                <div style={{ position: 'relative', height: '220px', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={selectedDossier.scan.imageUrl}
                    alt={selectedDossier.product.productName}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
                  Hash: {selectedDossier.scan.imageHash}
                </div>
              </div>

              {/* Commodity Profile */}
              <div
                style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  backgroundColor: 'var(--bg-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {selectedDossier.product.productName}
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                      Brand: <strong>{selectedDossier.product.brand}</strong> &bull; SKU: {selectedDossier.product.sku}
                    </p>
                  </div>
                  <div>{renderStatusBadge(selectedDossier.inspection.overallStatus)}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.35rem', fontSize: '0.75rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Manufacturer / Packer:</span>
                    <div style={{ fontWeight: 600 }}>{selectedDossier.product.manufacturerName}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>{selectedDossier.product.manufacturerAddress}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Declared Retail Price:</span>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--brand-blue)' }}>
                      {selectedDossier.inspection.mrpDeclared}
                    </div>
                    {selectedDossier.inspection.unitSalePriceDeclared && (
                      <div style={{ color: 'var(--text-secondary)' }}>USP: {selectedDossier.inspection.unitSalePriceDeclared}</div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.25rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Batch / Lot:</span>
                    <div style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{selectedDossier.inspection.batchNumber}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Date of Mfg:</span>
                    <div style={{ fontWeight: 600 }}>{selectedDossier.inspection.dateOfManufacture}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Inspected At:</span>
                    <div style={{ fontWeight: 600 }}>{new Date(selectedDossier.inspection.inspectedAt).toLocaleDateString('en-IN')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Row: Navigation Tabs within Dossier */}
            <div style={{ display: 'flex', gap: '0.35rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <Button
                variant={activeDetailsTab === 'RULES' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveDetailsTab('RULES')}
                leftIcon={<FileText size={14} />}
              >
                Rule Checks ({selectedDossier.complianceResults.length})
              </Button>
              <Button
                variant={activeDetailsTab === 'VIOLATIONS' ? 'danger' : 'secondary'}
                size="sm"
                onClick={() => setActiveDetailsTab('VIOLATIONS')}
                leftIcon={<AlertOctagon size={14} />}
              >
                Violations ({selectedDossier.violations.length})
              </Button>
              <Button
                variant={activeDetailsTab === 'DECLARATIONS' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveDetailsTab('DECLARATIONS')}
                leftIcon={<Layers size={14} />}
              >
                Extracted Fields ({selectedDossier.extractedDeclarations.length})
              </Button>
            </div>

            {/* TAB 1: RULES TABLE */}
            {activeDetailsTab === 'RULES' && (
              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeaderCell style={{ width: '25%' }}>Rule Clause</TableHeaderCell>
                      <TableHeaderCell style={{ width: '18%' }}>Status</TableHeaderCell>
                      <TableHeaderCell style={{ width: '57%' }}>Statutory Finding & Evidence</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedDossier.complianceResults.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div style={{ fontWeight: 700, color: 'var(--brand-blue)' }}>{r.statutoryClause}</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{r.ruleId}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={r.status as any} size="sm">{r.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <p style={{ fontSize: '0.8125rem', color: r.status === 'FAIL' ? '#b91c1c' : 'inherit', fontWeight: r.status === 'FAIL' ? 600 : 400 }}>
                            {r.statutoryReason}
                          </p>
                          {r.evidenceSummary && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                              Observed: {r.evidenceSummary}
                            </div>
                          )}
                          {r.suggestedRemedy && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--brand-blue)', marginTop: '0.2rem' }}>
                              Remedy: {r.suggestedRemedy}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* TAB 2: VIOLATIONS SECTION */}
            {activeDetailsTab === 'VIOLATIONS' && (
              <div>
                {selectedDossier.violations.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <ShieldCheck size={36} color="#15803d" style={{ margin: '0 auto 0.5rem' }} />
                    <h4 style={{ fontWeight: 600, color: '#15803d' }}>No Statutory Violations Recorded</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      All mandatory declarations conform to Legal Metrology (Packaged Commodities) Rules, 2011.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {selectedDossier.violations.map((v) => (
                      <div
                        key={v.violationId}
                        style={{
                          border: '1px solid #fca5a5',
                          backgroundColor: '#fef2f2',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.85rem 1rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, color: '#991b1b', fontSize: '0.875rem' }}>
                            {v.violationId}: Violation of {v.clause}
                          </span>
                          <Badge variant="NON_COMPLIANT" size="sm">Severity: {v.severity}</Badge>
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: '#7f1d1d', marginTop: '0.35rem', fontWeight: 500 }}>
                          {v.detectedIssue}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', fontSize: '0.75rem', color: '#991b1b' }}>
                          <span>Statutory Action: <strong>{v.penaltySection}</strong></span>
                          <span>Est. Compounding Fine: <strong>₹ {v.estimatedFineInr?.toLocaleString('en-IN') || '25,000'}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: EXTRACTED FIELDS */}
            {activeDetailsTab === 'DECLARATIONS' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto' }}>
                {selectedDossier.extractedDeclarations.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        {d.declarationKey.replace('_', ' ')}
                      </span>
                      <Badge variant="INFO" size="sm">{d.confidenceScore}% Conf.</Badge>
                    </div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                      {d.rawValue}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
