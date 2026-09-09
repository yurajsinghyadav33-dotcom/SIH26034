import assert from 'assert';
import { inspectionService } from './InspectionService.js';

async function testMetrics() {
  console.log('=== TEST SUITE: STEP 13 DASHBOARD OPERATIONAL METRICS ===\n');

  console.log('[1/3] Fetching aggregated dashboard metrics from real inspection data...');
  const metrics = await inspectionService.getDashboardMetrics();

  console.log(`Total Inspections: ${metrics.totalInspections}`);
  console.log(`Compliant: ${metrics.compliantCount}`);
  console.log(`Non-Compliant: ${metrics.nonCompliantCount}`);
  console.log(`Needs Review: ${metrics.needsReviewCount}`);
  console.log(`Compliance Rate: ${metrics.complianceRate}%\n`);

  assert.ok(metrics.totalInspections >= 4, 'Should have at least 4 seeded genuine inspections');
  assert.strictEqual(
    metrics.totalInspections,
    metrics.compliantCount + metrics.nonCompliantCount + metrics.needsReviewCount,
    'Sum of statuses must equal total inspections'
  );
  assert.ok(metrics.complianceRate >= 0 && metrics.complianceRate <= 100, 'Compliance rate must be between 0 and 100');

  console.log('[2/3] Verifying common violation categories aggregation...');
  console.log('Common Violations:', metrics.commonViolations);
  assert.ok(metrics.commonViolations.length >= 2, 'Should aggregate genuine violations (Rule 12, Rule 6(1)(e))');

  const totalPercentage = metrics.commonViolations.reduce((acc, v) => acc + v.percentage, 0);
  assert.ok(totalPercentage >= 95 && totalPercentage <= 105, 'Violation percentages should sum to approximately 100%');

  console.log('\n[3/3] Verifying category breakdown and trend data...');
  console.log('Category Breakdown:', metrics.categoryBreakdown);
  assert.ok(metrics.categoryBreakdown.length >= 2, 'Should have at least Food and Cosmetics categories');

  console.log('Recent Inspections Count:', metrics.recentInspections.length);
  assert.ok(metrics.recentInspections.length >= 4, 'Should have recent inspections');

  console.log(`Has Sufficient Trend Data: ${metrics.hasSufficientTrendData}`);
  assert.strictEqual(typeof metrics.hasSufficientTrendData, 'boolean');

  console.log('\n🌟 ALL STEP 13 DASHBOARD OPERATIONAL METRICS TESTS PASSED CLEANLY!\n');
}

testMetrics().catch((err) => {
  console.error('❌ Dashboard metrics test failed:', err);
  process.exit(1);
});
